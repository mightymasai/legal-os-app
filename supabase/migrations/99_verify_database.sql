-- =============================================================================
-- VERIFICATION SCRIPT - Check Current Database State
-- =============================================================================
-- Run this to see what tables, functions, and triggers currently exist
-- =============================================================================

-- Show all tables in public schema
SELECT
    '📋 TABLES' as type,
    table_name as name,
    NULL as details
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show all functions in public schema
SELECT
    '⚙️ FUNCTIONS' as type,
    routine_name as name,
    routine_type as details
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Show all triggers
SELECT
    '🔔 TRIGGERS' as type,
    trigger_name as name,
    event_object_table as details
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Summary count
DO $$
DECLARE
    table_count INT;
    function_count INT;
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public';
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers WHERE trigger_schema = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DATABASE STATUS SUMMARY';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables: %', table_count;
    RAISE NOTICE 'Functions: %', function_count;
    RAISE NOTICE 'Triggers: %', trigger_count;
    RAISE NOTICE '';

    IF table_count = 19 AND function_count >= 6 THEN
        RAISE NOTICE '✅ Database looks good!';
        RAISE NOTICE 'Expected: 19 tables, 6+ functions';
        RAISE NOTICE 'You can proceed to get API keys and update .env.local';
    ELSIF table_count = 0 THEN
        RAISE NOTICE '❌ Database is empty!';
        RAISE NOTICE 'Run: 20260108_initial_schema_v2.sql';
    ELSIF table_count = 19 AND function_count < 6 THEN
        RAISE NOTICE '⚠️  Tables exist but triggers missing!';
        RAISE NOTICE 'Run: 20260108_auth_triggers.sql';
    ELSE
        RAISE NOTICE '⚠️  Unexpected state!';
        RAISE NOTICE 'Consider running cleanup script and starting over.';
    END IF;
    RAISE NOTICE '==============================================';
END $$;
