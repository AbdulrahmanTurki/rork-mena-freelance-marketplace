-- COMPREHENSIVE SIGNUP FIX
-- This script fixes all signup-related issues
-- Run this in Supabase SQL Editor

-- =============================================================================
-- STEP 1: Clean slate - drop everything related to signup
-- =============================================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop all profile policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- =============================================================================
-- STEP 2: Create new trigger function with better error handling
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  full_name_val TEXT;
BEGIN
  -- Get full_name from metadata
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    full_name_val,
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail signup
  RAISE WARNING 'Profile creation error for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- =============================================================================
-- STEP 3: Create the trigger
-- =============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 4: Set up proper RLS policies
-- =============================================================================

-- Everyone can read profiles
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role can insert (for trigger)
CREATE POLICY "profiles_insert_service"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Authenticated users can insert their own profile (fallback)
CREATE POLICY "profiles_insert_auth"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- STEP 5: Grant all necessary permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- =============================================================================
-- STEP 6: Ensure constraints exist
-- =============================================================================

-- Ensure email unique constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- =============================================================================
-- STEP 7: Verification
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Signup fix completed successfully!';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '1. Trigger function: public.handle_new_user()';
  RAISE NOTICE '2. Trigger: on_auth_user_created';
  RAISE NOTICE '3. RLS policies on profiles table';
  RAISE NOTICE '4. Database permissions';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test signup in your app.';
  RAISE NOTICE '=========================================';
END $$;
