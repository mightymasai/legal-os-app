-- =============================================================================
-- SIMPLE DATABASE CHECK
-- =============================================================================
-- Copy this entire file and run it in Supabase to see what you have
-- =============================================================================

-- Count tables
SELECT
    'Total tables in database:' as info,
    COUNT(*)::text as count
FROM information_schema.tables
WHERE table_schema = 'public';

-- List all tables
SELECT
    '📋 ' || table_name as "Your Tables"
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Show result
DO $$
DECLARE
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE STATUS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables found: %', table_count;
    RAISE NOTICE '';

    IF table_count = 19 THEN
        RAISE NOTICE '✅ SUCCESS! Your database is ready!';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Get API keys from Settings → API';
        RAISE NOTICE '2. Update .env.local with real keys';
        RAISE NOTICE '3. Restart dev server';
        RAISE NOTICE '4. Test signup at localhost:3000';
        RAISE NOTICE '';
        RAISE NOTICE 'You can SKIP the auth triggers for now.';
        RAISE NOTICE 'They will be added automatically later.';
    ELSIF table_count = 0 THEN
        RAISE NOTICE '❌ Database is empty!';
        RAISE NOTICE 'Run: 20260108_initial_schema_v2.sql';
    ELSE
        RAISE NOTICE '⚠️  Found % tables (expected 19)', table_count;
        RAISE NOTICE 'Run cleanup script then v2 migration again.';
    END IF;

    RAISE NOTICE '========================================';
END $$;
