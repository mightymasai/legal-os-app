-- Authentication triggers for Legal OS
-- Auto-create profile and organization on user signup

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    org_slug TEXT;
BEGIN
    -- Generate unique org slug from email
    org_slug := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]+', '-', 'g'));
    org_slug := org_slug || '-' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6);

    -- Create organization for new user
    INSERT INTO public.organizations (
        name,
        slug,
        billing_email,
        subscription_tier,
        subscription_status,
        trial_ends_at
    ) VALUES (
        SPLIT_PART(NEW.email, '@', 1) || '''s Firm',
        org_slug,
        NEW.email,
        'trial',
        'trialing',
        NOW() + INTERVAL '14 days'
    ) RETURNING id INTO org_id;

    -- Create profile
    INSERT INTO public.profiles (
        id,
        organization_id,
        email,
        full_name,
        role,
        onboarding_completed
    ) VALUES (
        NEW.id,
        org_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        'owner', -- First user is always owner
        FALSE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- UPDATE PROFILE ON USER METADATA CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile when user metadata changes
    UPDATE public.profiles
    SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        updated_at = NOW()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.handle_user_update();

-- ============================================================================
-- AUTO-LOG DOCUMENT ACCESS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_document_access()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    action_name TEXT;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        action_name := 'document_created';
    ELSIF TG_OP = 'UPDATE' THEN
        action_name := 'document_updated';
    ELSIF TG_OP = 'DELETE' THEN
        action_name := 'document_deleted';
        org_id := OLD.organization_id;
    END IF;

    IF TG_OP != 'DELETE' THEN
        org_id := NEW.organization_id;
    END IF;

    -- Log the action
    INSERT INTO public.audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        org_id,
        auth.uid(),
        action_name,
        'document',
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'title', COALESCE(NEW.title, OLD.title),
            'operation', TG_OP
        ),
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_document_changes ON documents;
CREATE TRIGGER log_document_changes
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION public.log_document_access();

-- ============================================================================
-- AUTO-INCREMENT DOCUMENT VERSION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment version number on content change
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        NEW.current_version := OLD.current_version + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_increment_version ON documents;
CREATE TRIGGER auto_increment_version
    BEFORE UPDATE ON documents
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION public.increment_document_version();

-- ============================================================================
-- TRACK TEMPLATE USAGE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE templates
    SET usage_count = usage_count + 1
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This would be triggered by application logic when creating document from template

-- ============================================================================
-- AUTO-CREATE NOTIFICATION FOR @MENTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_mention_notification(
    mentioned_user_id UUID,
    mentioning_user_id UUID,
    doc_id UUID,
    matter_id UUID DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    org_id UUID;
    mentioner_name TEXT;
    doc_title TEXT;
BEGIN
    -- Get organization and user details
    SELECT organization_id INTO org_id FROM profiles WHERE id = mentioned_user_id;
    SELECT full_name INTO mentioner_name FROM profiles WHERE id = mentioning_user_id;
    SELECT title INTO doc_title FROM documents WHERE id = doc_id;

    -- Create notification
    INSERT INTO notifications (
        organization_id,
        user_id,
        title,
        message,
        type,
        link_url,
        document_id,
        matter_id
    ) VALUES (
        org_id,
        mentioned_user_id,
        'You were mentioned',
        mentioner_name || ' mentioned you in "' || doc_title || '"',
        'mention',
        '/documents/' || doc_id,
        doc_id,
        matter_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTO-CREATE DEADLINE NOTIFICATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_upcoming_deadlines()
RETURNS void AS $$
DECLARE
    deadline_record RECORD;
BEGIN
    -- Find deadlines approaching in 1, 3, or 7 days
    FOR deadline_record IN
        SELECT d.*, p.organization_id
        FROM deadlines d
        JOIN profiles p ON d.assigned_to = p.id
        WHERE d.status = 'pending'
        AND d.reminder_sent = FALSE
        AND (
            d.due_date::DATE - CURRENT_DATE IN (
                SELECT UNNEST(d.reminder_intervals)
            )
        )
    LOOP
        -- Create notification
        INSERT INTO notifications (
            organization_id,
            user_id,
            title,
            message,
            type,
            link_url,
            deadline_id,
            matter_id
        ) VALUES (
            deadline_record.organization_id,
            deadline_record.assigned_to,
            'Upcoming Deadline',
            deadline_record.title || ' is due on ' || deadline_record.due_date::DATE,
            'deadline',
            '/matters/' || deadline_record.matter_id,
            deadline_record.id,
            deadline_record.matter_id
        );

        -- Mark reminder as sent for this interval
        -- (In production, you'd track which interval was sent)
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule this function to run daily via pg_cron or external scheduler

-- ============================================================================
-- VALIDATION FUNCTIONS
-- ============================================================================

-- Ensure user is part of organization
CREATE OR REPLACE FUNCTION public.validate_user_organization(user_id UUID, org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND organization_id = org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND (
            role IN ('owner', 'admin') OR
            permissions ? permission_name
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USAGE TRACKING TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_document_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Track document creation for billing
    PERFORM track_usage(NEW.organization_id, 'documents', 1);

    -- Check if organization is over limit
    IF (SELECT COUNT(*) FROM documents WHERE organization_id = NEW.organization_id) >
       (SELECT max_documents FROM organizations WHERE id = NEW.organization_id) THEN
        RAISE EXCEPTION 'Document limit exceeded for your plan';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_document_usage ON documents;
CREATE TRIGGER track_document_usage
    AFTER INSERT ON documents
    FOR EACH ROW
    EXECUTE FUNCTION public.track_document_creation();

-- Track AI usage
CREATE OR REPLACE FUNCTION public.track_ai_usage()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    current_usage INTEGER;
    max_credits INTEGER;
BEGIN
    -- Get organization
    SELECT organization_id INTO org_id FROM profiles WHERE id = NEW.user_id;

    -- Increment AI credits used
    UPDATE organizations
    SET ai_credits_used = ai_credits_used + 1
    WHERE id = org_id
    RETURNING ai_credits_used, ai_credits_monthly
    INTO current_usage, max_credits;

    -- Check if over limit (warning, not blocking)
    IF current_usage > max_credits THEN
        INSERT INTO notifications (
            organization_id,
            user_id,
            title,
            message,
            type
        ) VALUES (
            org_id,
            NEW.user_id,
            'AI Credits Limit Reached',
            'Your organization has exceeded the monthly AI credits limit. Consider upgrading your plan.',
            'warning'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS track_ai_credits ON ai_interactions;
CREATE TRIGGER track_ai_credits
    AFTER INSERT ON ai_interactions
    FOR EACH ROW
    EXECUTE FUNCTION public.track_ai_usage();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Authentication triggers configured successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Active triggers:';
    RAISE NOTICE '- Auto-create profile & organization on signup';
    RAISE NOTICE '- Auto-update profile on user changes';
    RAISE NOTICE '- Auto-log document access';
    RAISE NOTICE '- Auto-increment document versions';
    RAISE NOTICE '- Track usage for billing';
    RAISE NOTICE '- Create notifications for deadlines';
END $$;
