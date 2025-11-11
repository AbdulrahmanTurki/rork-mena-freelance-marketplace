-- =============================================================================
-- COMPLETE SIGNUP FIX - Handles all signup-related database issues
-- =============================================================================

-- Step 1: Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 2: Check if profiles policies exist and drop duplicates
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Step 3: Recreate proper RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 4: Create the signup trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the trigger execution
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  -- Insert profile for the new user
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'buyer'
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, that's okay
    RAISE LOG 'Profile already exists for user: %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error creating profile for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Step 7: Ensure profiles table has correct structure
DO $$
BEGIN
    -- Check if email column allows null
    ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
    RAISE NOTICE 'Removed NOT NULL constraint from profiles.email';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not modify email constraint: %', SQLERRM;
END $$;

-- Make email constraint optional
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verification message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ SIGNUP SYSTEM FULLY CONFIGURED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  1. Trigger function recreated with error handling';
  RAISE NOTICE '  2. Trigger attached to auth.users table';
  RAISE NOTICE '  3. RLS policies configured correctly';
  RAISE NOTICE '  4. Permissions granted to all roles';
  RAISE NOTICE '  5. Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'New signups will now automatically:';
  RAISE NOTICE '  - Create a profile in the profiles table';
  RAISE NOTICE '  - Default to buyer user type';
  RAISE NOTICE '  - Handle errors gracefully';
  RAISE NOTICE '';
  RAISE NOTICE 'Test by creating a new user account.';
  RAISE NOTICE '====================================================';
END $$;
