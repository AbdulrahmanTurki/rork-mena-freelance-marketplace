-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this after 01-complete-schema.sql
-- This script is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

DO $
DECLARE
  tables_to_secure TEXT[] := ARRAY[
    'profiles', 'seller_verifications', 'categories', 'gigs', 'orders',
    'order_revisions', 'messages', 'seller_wallets', 'withdrawal_requests',
    'transactions', 'financial_logs', 'escrow_settings', 'reviews',
    'disputes', 'admin_roles', 'notifications', 'user_preferences', 'payment_methods'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables_to_secure
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      RAISE NOTICE '✓ RLS enabled on: %', tbl;
    ELSE
      RAISE WARNING '→ Table % does not exist, skipping RLS', tbl;
    END IF;
  END LOOP;
END $;

-- =============================================================================
-- DROP EXISTING POLICIES (CLEAN SLATE)
-- =============================================================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- SELLER VERIFICATIONS POLICIES
-- =============================================================================

CREATE POLICY "seller_verifications_select_own"
  ON seller_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "seller_verifications_insert_own"
  ON seller_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_verifications_update_own"
  ON seller_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- CATEGORIES POLICIES (PUBLIC READ)
-- =============================================================================

CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

-- =============================================================================
-- GIGS POLICIES
-- =============================================================================

CREATE POLICY "gigs_select_all"
  ON gigs FOR SELECT
  USING (true);

CREATE POLICY "gigs_insert_own"
  ON gigs FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "gigs_update_own"
  ON gigs FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "gigs_delete_own"
  ON gigs FOR DELETE
  USING (auth.uid() = seller_id);

-- =============================================================================
-- ORDERS POLICIES
-- =============================================================================

CREATE POLICY "orders_select_involved"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "orders_insert_buyer"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "orders_update_involved"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- =============================================================================
-- ORDER REVISIONS POLICIES
-- =============================================================================

CREATE POLICY "order_revisions_select_involved"
  ON order_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_revisions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "order_revisions_insert_involved"
  ON order_revisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_revisions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "order_revisions_update_involved"
  ON order_revisions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_revisions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- =============================================================================
-- MESSAGES POLICIES
-- =============================================================================

CREATE POLICY "messages_select_involved"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_receiver"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- =============================================================================
-- SELLER WALLETS POLICIES
-- =============================================================================

CREATE POLICY "seller_wallets_select_own"
  ON seller_wallets FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "seller_wallets_insert_own"
  ON seller_wallets FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "seller_wallets_update_own"
  ON seller_wallets FOR UPDATE
  USING (auth.uid() = seller_id);

-- =============================================================================
-- WITHDRAWAL REQUESTS POLICIES
-- =============================================================================

CREATE POLICY "withdrawal_requests_select_own"
  ON withdrawal_requests FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "withdrawal_requests_insert_own"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- =============================================================================
-- TRANSACTIONS POLICIES
-- =============================================================================

CREATE POLICY "transactions_select_involved"
  ON transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- =============================================================================
-- FINANCIAL LOGS POLICIES (ADMIN ONLY via service role)
-- =============================================================================

-- No user policies - only accessible via service role

-- =============================================================================
-- ESCROW SETTINGS POLICIES
-- =============================================================================

CREATE POLICY "escrow_settings_select_all"
  ON escrow_settings FOR SELECT
  USING (true);

-- =============================================================================
-- REVIEWS POLICIES
-- =============================================================================

CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_reviewer"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- =============================================================================
-- DISPUTES POLICIES
-- =============================================================================

CREATE POLICY "disputes_select_involved"
  ON disputes FOR SELECT
  USING (
    auth.uid() = opened_by OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "disputes_insert_involved"
  ON disputes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "disputes_update_involved"
  ON disputes FOR UPDATE
  USING (
    auth.uid() = opened_by OR
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- =============================================================================
-- ADMIN ROLES POLICIES (READ-ONLY for authenticated users)
-- =============================================================================

CREATE POLICY "admin_roles_select_all"
  ON admin_roles FOR SELECT
  USING (true);

-- =============================================================================
-- NOTIFICATIONS POLICIES
-- =============================================================================

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- USER PREFERENCES POLICIES
-- =============================================================================

CREATE POLICY "user_preferences_select_own"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================================================
-- PAYMENT METHODS POLICIES
-- =============================================================================

CREATE POLICY "payment_methods_select_own"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_delete_own"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $
DECLARE
  policy_count INTEGER;
  rls_enabled_count INTEGER;
  expected_table_count INTEGER := 18;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ RLS POLICIES SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Total policies created: %', policy_count;
  
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true;
  
  RAISE NOTICE 'Tables with RLS enabled: % / %', rls_enabled_count, expected_table_count;
  
  IF rls_enabled_count < expected_table_count THEN
    RAISE WARNING 'Not all tables have RLS enabled!';
  ELSE
    RAISE NOTICE '✓ All tables secured with RLS';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run 03-functions-triggers.sql';
  RAISE NOTICE '====================================================';
END $;
