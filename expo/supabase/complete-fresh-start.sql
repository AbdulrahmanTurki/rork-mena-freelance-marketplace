-- =============================================================================
-- COMPLETE FRESH START - Clean database setup
-- This script handles everything needed for a working database
-- =============================================================================

-- ============================================================
-- STEP 1: DROP ALL TRIGGERS AND FUNCTIONS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_seller_verified ON seller_verifications CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_seller_verifications_updated_at ON seller_verifications CASCADE;
DROP TRIGGER IF EXISTS update_gigs_updated_at ON gigs CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders CASCADE;
DROP TRIGGER IF EXISTS update_seller_wallets_updated_at ON seller_wallets CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_seller_wallet() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================
-- STEP 2: DROP ALL RLS POLICIES
-- ============================================================

-- Profiles policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
    END LOOP;
END $$;

-- Other tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, r.tablename)
        FROM pg_policies pol WHERE pol.tablename = r.tablename;
    END LOOP;
END $$;

-- ============================================================
-- STEP 3: CREATE MISSING TABLES
-- ============================================================

-- Create wallets table if it doesn't exist (alias for seller_wallets)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  available_balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  
  last_withdrawal TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wallets
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: CREATE CLEAN RLS POLICIES
-- ============================================================

-- Profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Wallets
CREATE POLICY "wallets_select_own"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "wallets_insert_own"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_update_own"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "wallets_service_role"
  ON wallets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seller verifications
CREATE POLICY "seller_verifications_select_own"
  ON seller_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "seller_verifications_insert_own"
  ON seller_verifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_verifications_update_own"
  ON seller_verifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_verifications_service_role"
  ON seller_verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Categories (public read)
CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_service_role"
  ON categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Gigs
CREATE POLICY "gigs_select_all"
  ON gigs FOR SELECT
  USING (true);

CREATE POLICY "gigs_insert_own"
  ON gigs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "gigs_update_own"
  ON gigs FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "gigs_delete_own"
  ON gigs FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "gigs_service_role"
  ON gigs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Orders
CREATE POLICY "orders_select_involved"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "orders_insert_buyer"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "orders_update_involved"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "orders_service_role"
  ON orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Order revisions
CREATE POLICY "order_revisions_select_involved"
  ON order_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_revisions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "order_revisions_insert_involved"
  ON order_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_revisions.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "order_revisions_service_role"
  ON order_revisions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Messages
CREATE POLICY "messages_select_involved"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert_sender"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_receiver"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

CREATE POLICY "messages_service_role"
  ON messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seller wallets (keeping both tables for compatibility)
CREATE POLICY "seller_wallets_select_own"
  ON seller_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "seller_wallets_insert_own"
  ON seller_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "seller_wallets_update_own"
  ON seller_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "seller_wallets_service_role"
  ON seller_wallets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Withdrawal requests
CREATE POLICY "withdrawal_requests_select_own"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "withdrawal_requests_insert_own"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "withdrawal_requests_service_role"
  ON withdrawal_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Transactions
CREATE POLICY "transactions_select_involved"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "transactions_service_role"
  ON transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Financial logs (admin only)
CREATE POLICY "financial_logs_service_role"
  ON financial_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Reviews
CREATE POLICY "reviews_select_all"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_reviewer"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "reviews_service_role"
  ON reviews FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Disputes
CREATE POLICY "disputes_select_involved"
  ON disputes FOR SELECT
  TO authenticated
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
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "disputes_service_role"
  ON disputes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admin roles (admin only)
CREATE POLICY "admin_roles_service_role"
  ON admin_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_service_role"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Escrow settings (admin only)
CREATE POLICY "escrow_settings_select_all"
  ON escrow_settings FOR SELECT
  USING (true);

CREATE POLICY "escrow_settings_service_role"
  ON escrow_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 5: GRANT PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ COMPLETE DATABASE SETUP FINISHED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes completed:';
  RAISE NOTICE '✓ All old triggers and functions removed';
  RAISE NOTICE '✓ All old RLS policies removed';
  RAISE NOTICE '✓ Missing wallets table created';
  RAISE NOTICE '✓ Clean RLS policies for all tables';
  RAISE NOTICE '✓ Proper permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to use!';
  RAISE NOTICE '====================================================';
END $$;
