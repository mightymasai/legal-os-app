-- =============================================================================
-- CLEANUP SCRIPT - Run this FIRST to start fresh
-- =============================================================================
-- WARNING: This will delete ALL data in your public schema!
-- Only use this if you're setting up for the first time or need to reset
-- =============================================================================

-- Drop all existing tables in the correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.usage_records CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.integrations CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.ai_interactions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.active_workflows CASCADE;
DROP TABLE IF EXISTS public.workflow_templates CASCADE;
DROP TABLE IF EXISTS public.case_predictions CASCADE;
DROP TABLE IF EXISTS public.legal_research CASCADE;
DROP TABLE IF EXISTS public.conflict_checks CASCADE;
DROP TABLE IF EXISTS public.deadlines CASCADE;
DROP TABLE IF EXISTS public.document_versions CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.matters CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.user_organization_id() CASCADE;

-- Drop any existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify everything is clean
DO $$
BEGIN
    RAISE NOTICE 'Cleanup complete! All tables and functions dropped.';
    RAISE NOTICE 'You can now run the main migration: 20260108_initial_schema_v2.sql';
END $$;
