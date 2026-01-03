-- Fix Admin Login for admin_final@gmail.com
-- This script will create the user if needed and set up admin role

-- Step 1: Check if user exists, if not, instructions to create
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin_final@gmail.com';
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = admin_email;

  IF admin_user_id IS NULL THEN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'USER DOES NOT EXIST!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'You need to create this user first:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" button';
    RAISE NOTICE '3. Choose "Create new user"';
    RAISE NOTICE '4. Email: admin_final@gmail.com';
    RAISE NOTICE '5. Password: password123';
    RAISE NOTICE '6. Check "Auto Confirm User"';
    RAISE NOTICE '7. Click "Create user"';
    RAISE NOTICE '8. Then run this script again';
    RAISE NOTICE '==================================================';
  ELSE
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'USER FOUND! ID: %', admin_user_id;
    RAISE NOTICE '==================================================';
    
    -- Ensure admin_roles table exists
    CREATE TABLE IF NOT EXISTS admin_roles (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'support_agent', 'finance_admin')),
      permissions JSONB DEFAULT '{"all": true}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
    
    -- Drop and recreate policies
    DROP POLICY IF EXISTS "Admins can view own role" ON admin_roles;
    DROP POLICY IF EXISTS "Super admins can manage all roles" ON admin_roles;
    
    CREATE POLICY "Admins can view own role" 
      ON admin_roles FOR SELECT 
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Super admins can manage all roles" 
      ON admin_roles FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM admin_roles 
          WHERE user_id = auth.uid() 
          AND role = 'super_admin'
        )
      );
    
    -- Create or update profile
    INSERT INTO profiles (id, email, full_name, user_type)
    VALUES (admin_user_id, admin_email, 'Admin Final', 'buyer')
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;
    
    RAISE NOTICE 'Profile created/updated';
    
    -- Create or update admin role
    INSERT INTO admin_roles (user_id, role, permissions)
    VALUES (admin_user_id, 'super_admin', '{"all": true}'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = EXCLUDED.role, permissions = EXCLUDED.permissions;
    
    RAISE NOTICE 'Admin role created/updated';
    
    -- Recreate RPC function
    DROP FUNCTION IF EXISTS get_my_admin_role();
    
    CREATE OR REPLACE FUNCTION get_my_admin_role()
    RETURNS TABLE (
      role TEXT,
      permissions JSONB
    ) 
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      RETURN QUERY
      SELECT 
        admin_roles.role,
        admin_roles.permissions
      FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
      LIMIT 1;
    END;
    $func$;
    
    RAISE NOTICE 'RPC function created';
    RAISE NOTICE '==================================================';
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'You can now login with:';
    RAISE NOTICE 'Email: admin_final@gmail.com';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE '==================================================';
  END IF;
END $$;

-- Show the result
SELECT 
  u.email,
  p.full_name,
  ar.role,
  ar.permissions
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN admin_roles ar ON ar.user_id = u.id
WHERE u.email = 'admin_final@gmail.com';
