-- =============================================================================
-- DROP ALL AND RECREATE - Nuclear option that removes everything first
-- =============================================================================

-- ============================================================
-- STEP 1: DROP ALL POSSIBLE TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created_trigger ON auth.users CASCADE;
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users CASCADE;

-- ============================================================
-- STEP 2: DROP ALL POSSIBLE FUNCTIONS
-- ============================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_user() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_user() CASCADE;

-- ============================================================
-- STEP 3: DROP ALL POSSIBLE RLS POLICIES ON PROFILES
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile after signup" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access to profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- ============================================================
-- STEP 4: DROP ALL POSSIBLE RLS POLICIES ON OTHER TABLES
-- ============================================================

-- Wallets
DROP POLICY IF EXISTS "wallet_select_own" ON wallets;
DROP POLICY IF EXISTS "wallet_insert_own" ON wallets;
DROP POLICY IF EXISTS "wallet_update_own" ON wallets;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can create own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;

-- Categories
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

-- Gigs
DROP POLICY IF EXISTS "gigs_select_all" ON gigs;
DROP POLICY IF EXISTS "gigs_insert_own" ON gigs;
DROP POLICY IF EXISTS "gigs_update_own" ON gigs;
DROP POLICY IF EXISTS "gigs_delete_own" ON gigs;

-- Orders
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_buyer" ON orders;
DROP POLICY IF EXISTS "orders_update_involved" ON orders;

-- Messages
DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_insert_own" ON messages;

-- Transactions
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;

-- ============================================================
-- STEP 5: RECREATE CLEAN RLS POLICIES FOR PROFILES
-- ============================================================

-- Public read access to all profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access
CREATE POLICY "profiles_service_role"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================================

-- Grant to authenticated users
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- Grant to service role
GRANT ALL ON profiles TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- VERIFICATION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ DATABASE CLEANUP AND RECREATION COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'All old policies, triggers, and functions removed';
  RAISE NOTICE 'Clean RLS policies created for profiles';
  RAISE NOTICE '';
  RAISE NOTICE 'Signup flow:';
  RAISE NOTICE '1. User signs up via supabase.auth.signUp()';
  RAISE NOTICE '2. App creates profile manually';
  RAISE NOTICE '3. No database triggers - all handled by app';
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
END $$;
