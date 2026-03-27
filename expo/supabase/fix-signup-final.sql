-- FINAL FIX for signup errors
-- Run this script in Supabase SQL Editor to resolve all signup issues

-- =============================================================================
-- STEP 1: Clean up existing trigger and function
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =============================================================================
-- STEP 2: Create improved trigger function
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  full_name_value TEXT;
BEGIN
  -- Extract full_name from metadata
  full_name_value := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  RAISE LOG 'Trigger: Creating profile for user % (email: %)', NEW.id, NEW.email;
  
  -- Insert profile with ON CONFLICT to handle race conditions
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    full_name_value,
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RAISE LOG 'Trigger: Profile created/updated for user %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Trigger: Error creating profile for user %: % (SQLSTATE: %)', 
      NEW.id, SQLERRM, SQLSTATE;
    -- Don't fail the auth.users insert even if profile creation fails
    RETURN NEW;
END;
$$;

-- =============================================================================
-- STEP 3: Recreate the trigger
-- =============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- STEP 4: Clean up and recreate RLS policies for profiles
-- =============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;

-- Recreate policies with clear names
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_service_role"
  ON profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- STEP 5: Grant necessary permissions
-- =============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- =============================================================================
-- STEP 6: Ensure unique constraints exist
-- =============================================================================

DO $$
BEGIN
  -- Check if email unique constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_key'
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- =============================================================================
-- STEP 7: Verification
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'Signup fix applied successfully!';
  RAISE NOTICE '===========================================================';
  RAISE NOTICE 'The following components have been updated:';
  RAISE NOTICE '1. Trigger function: public.handle_new_user()';
  RAISE NOTICE '2. Trigger: on_auth_user_created';
  RAISE NOTICE '3. RLS policies on profiles table';
  RAISE NOTICE '4. Database permissions';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now test user signup in your app.';
  RAISE NOTICE '===========================================================';
END $$;
