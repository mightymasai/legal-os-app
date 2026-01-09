-- Legal OS Database Schema
-- Production-ready schema for multi-tenant SaaS platform
-- Run this migration in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ORGANIZATIONS & TEAMS (Multi-tenant architecture)
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    billing_email TEXT NOT NULL,

    -- Subscription & Licensing
    subscription_tier TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'starter', 'professional', 'enterprise', 'white_label')),
    subscription_status TEXT NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'paused')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    trial_ends_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,

    -- Usage limits based on tier
    max_users INTEGER DEFAULT 3,
    max_documents INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 10,
    ai_credits_monthly INTEGER DEFAULT 100,
    ai_credits_used INTEGER DEFAULT 0,

    -- White-label branding
    custom_domain TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#3B82F6',
    is_white_label BOOLEAN DEFAULT FALSE,

    -- Settings
    settings JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer ON organizations(stripe_customer_id);

-- ============================================================================
-- USER PROFILES (Enhanced with organization membership)
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

    -- Profile info
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    job_title TEXT,
    bar_number TEXT, -- Attorney bar registration number

    -- Role & permissions
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'attorney', 'paralegal', 'member', 'client_portal')),
    permissions JSONB DEFAULT '[]'::JSONB,

    -- Settings
    preferences JSONB DEFAULT '{}'::JSONB,
    onboarding_completed BOOLEAN DEFAULT FALSE,

    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,

    -- Timestamps
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================================
-- CLIENTS
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),

    -- Client information
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    company TEXT,

    -- Classification
    client_type TEXT DEFAULT 'individual' CHECK (client_type IN ('individual', 'business', 'government', 'nonprofit')),
    industry TEXT,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

    -- Portal access
    portal_access BOOLEAN DEFAULT FALSE,
    portal_user_id UUID REFERENCES auth.users(id),

    -- Additional data
    notes TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_email ON clients(email);

-- ============================================================================
-- MATTERS (Cases)
-- ============================================================================

CREATE TABLE matters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id),

    -- Matter details
    title TEXT NOT NULL,
    description TEXT,
    case_number TEXT,
    case_type TEXT,

    -- Court information
    court TEXT,
    jurisdiction TEXT,
    judge TEXT,
    opposing_party TEXT,
    opposing_counsel TEXT,

    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'closed', 'settled', 'dismissed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Important dates
    filed_date DATE,
    deadline TIMESTAMPTZ,
    closed_date DATE,

    -- Financial
    estimated_value DECIMAL(12,2),
    hourly_rate DECIMAL(10,2),
    flat_fee DECIMAL(12,2),

    -- Team assignment
    assigned_attorneys UUID[] DEFAULT '{}',
    assigned_paralegals UUID[] DEFAULT '{}',

    -- Conflict checking
    conflict_checked BOOLEAN DEFAULT FALSE,
    conflict_check_date TIMESTAMPTZ,
    conflict_status TEXT,

    -- Additional data
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matters_organization ON matters(organization_id);
CREATE INDEX idx_matters_client ON matters(client_id);
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_created_by ON matters(created_by);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id),

    -- Document details
    title TEXT NOT NULL,
    content TEXT,
    content_encrypted BYTEA, -- For encrypted storage
    is_encrypted BOOLEAN DEFAULT FALSE,

    -- Versioning
    current_version INTEGER DEFAULT 1,

    -- Classification
    document_type TEXT DEFAULT 'general' CHECK (document_type IN (
        'contract', 'pleading', 'motion', 'brief', 'memo',
        'correspondence', 'discovery', 'evidence', 'general'
    )),

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'final', 'archived', 'template')),

    -- File metadata
    file_size INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,

    -- Collaboration
    locked_by UUID REFERENCES profiles(id),
    locked_at TIMESTAMPTZ,

    -- AI tracking
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_reviewed BOOLEAN DEFAULT FALSE,

    -- Additional data
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_matter ON documents(matter_id);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(document_type);

-- ============================================================================
-- DOCUMENT VERSIONS
-- ============================================================================

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),

    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    file_size INTEGER DEFAULT 0,

    -- Snapshot metadata
    snapshot_metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);
CREATE INDEX idx_document_versions_number ON document_versions(document_id, version_number DESC);

-- ============================================================================
-- DOCUMENT TEMPLATES
-- ============================================================================

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),

    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,

    -- Template classification
    category TEXT DEFAULT 'general' CHECK (category IN (
        'contract', 'pleading', 'motion', 'brief', 'discovery', 'general'
    )),
    jurisdiction TEXT,

    -- Visibility
    is_public BOOLEAN DEFAULT FALSE, -- Shared templates across all orgs
    is_premium BOOLEAN DEFAULT FALSE, -- Requires higher tier

    -- Usage tracking
    usage_count INTEGER DEFAULT 0,

    -- Variables/placeholders
    variables JSONB DEFAULT '[]'::JSONB, -- [{"name": "client_name", "type": "text"}]

    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_organization ON templates(organization_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- DOCUMENT SHARING & COLLABORATION
-- ============================================================================

CREATE TABLE document_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES profiles(id),
    shared_with_user_id UUID REFERENCES profiles(id),
    shared_with_email TEXT, -- For external sharing

    permissions TEXT NOT NULL DEFAULT 'view' CHECK (permissions IN ('view', 'comment', 'edit')),

    -- Expiration
    expires_at TIMESTAMPTZ,

    -- Access tracking
    accessed_at TIMESTAMPTZ,
    access_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_shares_document ON document_shares(document_id);
CREATE INDEX idx_document_shares_user ON document_shares(shared_with_user_id);

-- ============================================================================
-- DEADLINES & CALENDAR
-- ============================================================================

CREATE TABLE deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id),

    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,

    -- Classification
    deadline_type TEXT DEFAULT 'general' CHECK (deadline_type IN (
        'filing', 'court_appearance', 'discovery', 'internal', 'client', 'general'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Assignment
    assigned_to UUID REFERENCES profiles(id),

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'canceled')),
    completed_at TIMESTAMPTZ,

    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_intervals INTEGER[] DEFAULT '{1, 3, 7}', -- Days before deadline

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deadlines_organization ON deadlines(organization_id);
CREATE INDEX idx_deadlines_matter ON deadlines(matter_id);
CREATE INDEX idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX idx_deadlines_assigned_to ON deadlines(assigned_to);

-- ============================================================================
-- WORKFLOW AUTOMATION
-- ============================================================================

CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),

    name TEXT NOT NULL,
    description TEXT,
    case_type TEXT,
    jurisdiction TEXT,

    -- Workflow definition
    steps JSONB NOT NULL DEFAULT '[]'::JSONB,
    /*
    steps: [
        {
            "step_number": 1,
            "name": "File Complaint",
            "type": "document_generation",
            "template_id": "uuid",
            "deadline_days": 0,
            "assigned_role": "attorney"
        }
    ]
    */

    -- Default settings
    default_deadlines JSONB DEFAULT '{}'::JSONB,
    notifications JSONB DEFAULT '[]'::JSONB,

    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_templates_organization ON workflow_templates(organization_id);

CREATE TABLE active_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,

    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'canceled')),
    current_step INTEGER DEFAULT 1,
    progress_percentage INTEGER DEFAULT 0,

    -- Execution data
    step_data JSONB DEFAULT '{}'::JSONB,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_active_workflows_organization ON active_workflows(organization_id);
CREATE INDEX idx_active_workflows_matter ON active_workflows(matter_id);

-- ============================================================================
-- LEGAL RESEARCH
-- ============================================================================

CREATE TABLE legal_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id),

    query TEXT NOT NULL,
    research_type TEXT NOT NULL CHECK (research_type IN (
        'case_law', 'statute', 'regulation', 'secondary_source', 'general'
    )),
    jurisdiction TEXT,

    -- Results
    results JSONB DEFAULT '[]'::JSONB,
    result_count INTEGER DEFAULT 0,

    -- AI usage
    ai_powered BOOLEAN DEFAULT FALSE,
    ai_model TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legal_research_organization ON legal_research(organization_id);
CREATE INDEX idx_legal_research_matter ON legal_research(matter_id);
CREATE INDEX idx_legal_research_created_by ON legal_research(created_by);

-- ============================================================================
-- CASE PREDICTIONS
-- ============================================================================

CREATE TABLE case_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),

    predicted_outcome TEXT,
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00

    -- Analysis factors
    key_factors JSONB DEFAULT '[]'::JSONB,
    risk_assessment TEXT CHECK (risk_assessment IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_factors JSONB DEFAULT '[]'::JSONB,

    -- Recommendations
    recommendations JSONB DEFAULT '[]'::JSONB,
    similar_cases JSONB DEFAULT '[]'::JSONB,

    -- Model info
    ai_model TEXT,
    model_version TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_case_predictions_organization ON case_predictions(organization_id);
CREATE INDEX idx_case_predictions_matter ON case_predictions(matter_id);

-- ============================================================================
-- CONFLICT CHECKING
-- ============================================================================

CREATE TABLE conflict_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,
    checked_by UUID REFERENCES profiles(id),

    -- Parties involved
    parties_involved JSONB NOT NULL DEFAULT '[]'::JSONB,
    /*
    [
        {"name": "John Doe", "type": "client", "relationships": []},
        {"name": "Acme Corp", "type": "opposing_party", "relationships": []}
    ]
    */

    -- Results
    conflicts_found JSONB DEFAULT '[]'::JSONB,
    risk_level TEXT CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),

    -- Decision
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'conflicted', 'waived')),
    resolution_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conflict_checks_organization ON conflict_checks(organization_id);
CREATE INDEX idx_conflict_checks_matter ON conflict_checks(matter_id);

-- ============================================================================
-- AI INTERACTIONS & USAGE TRACKING
-- ============================================================================

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),

    -- Action details
    action TEXT NOT NULL, -- 'document_improve', 'legal_research', 'case_prediction', etc.
    input_text TEXT,
    output_text TEXT,

    -- AI details
    ai_model TEXT,
    tokens_used INTEGER,
    cost_cents INTEGER, -- Cost in cents

    -- Context
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    matter_id UUID REFERENCES matters(id) ON DELETE SET NULL,

    -- Quality tracking
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_organization ON ai_interactions(organization_id);
CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

-- ============================================================================
-- AUDIT LOGS
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id),

    -- Action details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'document', 'matter', 'user', etc.
    resource_id UUID,

    -- Details
    details JSONB DEFAULT '{}'::JSONB,

    -- Security tracking
    ip_address INET,
    user_agent TEXT,

    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,

    amount_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Line items
    line_items JSONB DEFAULT '[]'::JSONB,

    -- Dates
    due_date DATE,
    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Usage metrics
    metric TEXT NOT NULL, -- 'documents', 'storage_gb', 'ai_credits', 'users'
    quantity INTEGER NOT NULL,

    -- Period
    period DATE NOT NULL, -- Monthly aggregation

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_records_organization ON usage_records(organization_id, period DESC);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Notification content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'deadline', 'mention')),

    -- Link
    link_url TEXT,
    link_text TEXT,

    -- Status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Related resources
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    deadline_id UUID REFERENCES deadlines(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Integration details
    provider TEXT NOT NULL, -- 'docusign', 'clio', 'gmail', etc.
    status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),

    -- Auth tokens (encrypted)
    access_token_encrypted BYTEA,
    refresh_token_encrypted BYTEA,
    token_expires_at TIMESTAMPTZ,

    -- Configuration
    config JSONB DEFAULT '{}'::JSONB,

    -- Usage
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integrations_organization ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES: Users can read their own profile and others in their org
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view org members"
    ON profiles FOR SELECT
    USING (organization_id = public.user_organization_id());

-- ORGANIZATIONS: Users can view and update their own organization
CREATE POLICY "Users can view own organization"
    ON organizations FOR SELECT
    USING (id = public.user_organization_id());

CREATE POLICY "Admins can update organization"
    ON organizations FOR UPDATE
    USING (
        id = public.user_organization_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- CLIENTS: Organization-scoped access
CREATE POLICY "Users can view org clients"
    ON clients FOR ALL
    USING (organization_id = public.user_organization_id());

-- MATTERS: Organization-scoped access
CREATE POLICY "Users can view org matters"
    ON matters FOR ALL
    USING (organization_id = public.user_organization_id());

-- DOCUMENTS: Organization-scoped access + sharing
CREATE POLICY "Users can view org documents"
    ON documents FOR SELECT
    USING (
        organization_id = public.user_organization_id() OR
        EXISTS (
            SELECT 1 FROM document_shares
            WHERE document_id = documents.id
            AND shared_with_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create documents in org"
    ON documents FOR INSERT
    WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update own documents"
    ON documents FOR UPDATE
    USING (
        organization_id = public.user_organization_id() AND
        (created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM document_shares
            WHERE document_id = documents.id
            AND shared_with_user_id = auth.uid()
            AND permissions IN ('edit')
        ))
    );

CREATE POLICY "Users can delete own documents"
    ON documents FOR DELETE
    USING (organization_id = public.user_organization_id() AND created_by = auth.uid());

-- DOCUMENT_VERSIONS: Inherit from document permissions
CREATE POLICY "Users can view document versions"
    ON document_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM documents
            WHERE id = document_versions.document_id
            AND (
                organization_id = public.user_organization_id() OR
                EXISTS (
                    SELECT 1 FROM document_shares
                    WHERE document_id = documents.id
                    AND shared_with_user_id = auth.uid()
                )
            )
        )
    );

-- TEMPLATES: Organization-scoped + public templates
CREATE POLICY "Users can view templates"
    ON templates FOR SELECT
    USING (
        organization_id = public.user_organization_id() OR
        is_public = TRUE
    );

CREATE POLICY "Users can create org templates"
    ON templates FOR INSERT
    WITH CHECK (organization_id = public.user_organization_id());

CREATE POLICY "Users can update org templates"
    ON templates FOR UPDATE
    USING (organization_id = public.user_organization_id());

-- DEADLINES: Organization-scoped
CREATE POLICY "Users can manage org deadlines"
    ON deadlines FOR ALL
    USING (organization_id = public.user_organization_id());

-- WORKFLOW_TEMPLATES: Organization-scoped
CREATE POLICY "Users can manage org workflow templates"
    ON workflow_templates FOR ALL
    USING (organization_id = public.user_organization_id());

-- ACTIVE_WORKFLOWS: Organization-scoped
CREATE POLICY "Users can manage org workflows"
    ON active_workflows FOR ALL
    USING (organization_id = public.user_organization_id());

-- LEGAL_RESEARCH: Organization-scoped
CREATE POLICY "Users can manage org research"
    ON legal_research FOR ALL
    USING (organization_id = public.user_organization_id());

-- CASE_PREDICTIONS: Organization-scoped
CREATE POLICY "Users can manage org predictions"
    ON case_predictions FOR ALL
    USING (organization_id = public.user_organization_id());

-- CONFLICT_CHECKS: Organization-scoped
CREATE POLICY "Users can manage org conflicts"
    ON conflict_checks FOR ALL
    USING (organization_id = public.user_organization_id());

-- AI_INTERACTIONS: Organization-scoped
CREATE POLICY "Users can view org AI interactions"
    ON ai_interactions FOR ALL
    USING (organization_id = public.user_organization_id());

-- AUDIT_LOGS: Organization-scoped (read-only for non-admins)
CREATE POLICY "Users can view org audit logs"
    ON audit_logs FOR SELECT
    USING (organization_id = public.user_organization_id());

-- INVOICES: Organization admins only
CREATE POLICY "Admins can view org invoices"
    ON invoices FOR SELECT
    USING (
        organization_id = public.user_organization_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- USAGE_RECORDS: Organization admins only
CREATE POLICY "Admins can view org usage"
    ON usage_records FOR SELECT
    USING (
        organization_id = public.user_organization_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- NOTIFICATIONS: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- INTEGRATIONS: Organization admins only
CREATE POLICY "Admins can manage org integrations"
    ON integrations FOR ALL
    USING (
        organization_id = public.user_organization_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON matters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON deadlines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_active_workflows_updated_at BEFORE UPDATE ON active_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conflict_checks_updated_at BEFORE UPDATE ON conflict_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset monthly AI credits
CREATE OR REPLACE FUNCTION reset_monthly_ai_credits()
RETURNS void AS $$
BEGIN
    UPDATE organizations
    SET ai_credits_used = 0
    WHERE subscription_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Track usage for billing
CREATE OR REPLACE FUNCTION track_usage(
    org_id UUID,
    metric_name TEXT,
    qty INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO usage_records (organization_id, metric, quantity, period)
    VALUES (org_id, metric_name, qty, DATE_TRUNC('month', NOW()))
    ON CONFLICT (organization_id, metric, period)
    DO UPDATE SET quantity = usage_records.quantity + qty;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (for development/demo)
-- ============================================================================

-- Create a demo organization
INSERT INTO organizations (name, slug, billing_email, subscription_tier, subscription_status)
VALUES
    ('Demo Law Firm', 'demo-law-firm', 'billing@demolawfirm.com', 'professional', 'active'),
    ('Solo Practice', 'solo-practice', 'attorney@solopractice.com', 'starter', 'trialing')
ON CONFLICT DO NOTHING;

-- Note: User profiles will be created automatically when users sign up via Supabase Auth
-- The auth trigger should create a profile entry when a new user is created

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Legal OS database schema created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Configure Supabase Auth to create profiles on user signup';
    RAISE NOTICE '2. Set up Stripe webhooks for subscription management';
    RAISE NOTICE '3. Configure environment variables in your application';
    RAISE NOTICE '4. Test RLS policies with different user roles';
    RAISE NOTICE '';
    RAISE NOTICE 'Database includes:';
    RAISE NOTICE '- 20+ tables with full schema';
    RAISE NOTICE '- Row-Level Security policies';
    RAISE NOTICE '- Automated triggers and functions';
    RAISE NOTICE '- Multi-tenant architecture';
    RAISE NOTICE '- Audit logging and compliance';
END $$;
