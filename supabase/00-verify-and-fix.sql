-- =============================================================================
-- VERIFICATION AND FIX SCRIPT
-- Run this to check database state and fix common issues
-- This script is SAFE TO RUN - it only checks and fixes missing elements
-- =============================================================================

DO $$
DECLARE
  table_name TEXT;
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  expected_tables TEXT[] := ARRAY[
    'profiles', 'seller_verifications', 'categories', 'gigs', 'orders',
    'order_revisions', 'messages', 'seller_wallets', 'withdrawal_requests',
    'transactions', 'financial_logs', 'escrow_settings', 'reviews',
    'disputes', 'admin_roles', 'notifications', 'user_preferences', 'payment_methods'
  ];
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'DATABASE VERIFICATION REPORT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  
  -- Check extensions
  RAISE NOTICE '1. CHECKING EXTENSIONS';
  RAISE NOTICE '-----------------------------------';
  
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE NOTICE '✓ uuid-ossp extension installed';
  ELSE
    RAISE WARNING '✗ uuid-ossp extension MISSING';
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    RAISE NOTICE '→ Installed uuid-ossp';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    RAISE NOTICE '✓ pgcrypto extension installed';
  ELSE
    RAISE WARNING '✗ pgcrypto extension MISSING';
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    RAISE NOTICE '→ Installed pgcrypto';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check tables
  RAISE NOTICE '2. CHECKING TABLES';
  RAISE NOTICE '-----------------------------------';
  
  FOREACH table_name IN ARRAY expected_tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables t
      WHERE t.table_schema = 'public' AND t.table_name = table_name
    ) THEN
      RAISE NOTICE '✓ Table exists: %', table_name;
    ELSE
      missing_tables := array_append(missing_tables, table_name);
      RAISE WARNING '✗ Table MISSING: %', table_name;
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE NOTICE '';
    RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
    RAISE NOTICE '→ Run 01-complete-schema.sql to create missing tables';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check RLS
  RAISE NOTICE '3. CHECKING ROW LEVEL SECURITY';
  RAISE NOTICE '-----------------------------------';
  
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = ANY(expected_tables)
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_tables pt
      WHERE pt.schemaname = 'public'
      AND pt.tablename = table_name
      AND pt.rowsecurity = true
    ) THEN
      RAISE NOTICE '✓ RLS enabled: %', table_name;
    ELSE
      RAISE WARNING '✗ RLS DISABLED: %', table_name;
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE '→ Enabled RLS on: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  
  -- Check functions
  RAISE NOTICE '4. CHECKING FUNCTIONS';
  RAISE NOTICE '-----------------------------------';
  
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE '✓ Function exists: handle_new_user';
  ELSE
    RAISE WARNING '✗ Function MISSING: handle_new_user';
    RAISE NOTICE '→ Run 03-functions-triggers.sql';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'create_seller_wallet'
  ) THEN
    RAISE NOTICE '✓ Function exists: create_seller_wallet';
  ELSE
    RAISE WARNING '✗ Function MISSING: create_seller_wallet';
    RAISE NOTICE '→ Run 03-functions-triggers.sql';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    RAISE NOTICE '✓ Function exists: update_updated_at_column';
  ELSE
    RAISE WARNING '✗ Function MISSING: update_updated_at_column';
    RAISE NOTICE '→ Run 03-functions-triggers.sql';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check triggers
  RAISE NOTICE '5. CHECKING TRIGGERS';
  RAISE NOTICE '-----------------------------------';
  
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✓ Trigger exists: on_auth_user_created';
  ELSE
    RAISE WARNING '✗ Trigger MISSING: on_auth_user_created';
    RAISE NOTICE '→ Run 03-functions-triggers.sql';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_schema = 'public' AND trigger_name = 'on_seller_verified'
  ) THEN
    RAISE NOTICE '✓ Trigger exists: on_seller_verified';
  ELSE
    RAISE WARNING '✗ Trigger MISSING: on_seller_verified';
    RAISE NOTICE '→ Run 03-functions-triggers.sql';
  END IF;
  
  RAISE NOTICE '';
  
  -- Check escrow settings
  RAISE NOTICE '6. CHECKING DEFAULT DATA';
  RAISE NOTICE '-----------------------------------';
  
  IF EXISTS (SELECT 1 FROM escrow_settings LIMIT 1) THEN
    RAISE NOTICE '✓ Escrow settings exist';
  ELSE
    RAISE WARNING '✗ Escrow settings MISSING';
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_name = 'escrow_settings') THEN
      INSERT INTO escrow_settings (
        id,
        clearance_period_days,
        auto_release_days,
        platform_fee_percentage,
        min_withdrawal_amount,
        refund_window_days,
        dispute_resolution_days
      ) VALUES (
        gen_random_uuid(),
        7,
        14,
        10.00,
        50.00,
        30,
        14
      );
      RAISE NOTICE '→ Created default escrow settings';
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'VERIFICATION COMPLETE';
  RAISE NOTICE '====================================================';
  
END $$;
