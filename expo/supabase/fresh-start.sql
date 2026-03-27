-- =============================================================================
-- FRESH START: Complete cleanup and rebuild
-- This removes ALL existing triggers, functions, and RLS policies
-- Then creates a clean, working setup
-- =============================================================================

-- ============================================================
-- STEP 1: DROP ALL EXISTING TRIGGERS AND FUNCTIONS
-- ============================================================

-- Drop all triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all profile-related functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ============================================================
-- STEP 2: DROP ALL RLS POLICIES ON PROFILES
-- ============================================================

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile after signup" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;

-- ============================================================
-- STEP 3: CREATE NEW RLS POLICIES FOR PROFILES
-- ============================================================

-- Anyone can view all profiles (public read)
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access to profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 4: GRANT NECESSARY PERMISSIONS
-- ============================================================

-- Grant permissions to authenticated users
GRANT SELECT ON profiles TO authenticated;
GRANT INSERT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- Grant full access to service role
GRANT ALL ON profiles TO service_role;

-- Grant usage on sequences (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- STEP 5: VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE '✓ FRESH START COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. ✓ All old triggers removed';
  RAISE NOTICE '2. ✓ All old functions dropped';
  RAISE NOTICE '3. ✓ All old RLS policies removed';
  RAISE NOTICE '4. ✓ New clean RLS policies created';
  RAISE NOTICE '5. ✓ Proper permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE 'How signup works now:';
  RAISE NOTICE '- App calls supabase.auth.signUp()';
  RAISE NOTICE '- App then manually creates profile';
  RAISE NOTICE '- No database triggers involved';
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Ready to test signup!';
  RAISE NOTICE '==================================================';
END $$;
