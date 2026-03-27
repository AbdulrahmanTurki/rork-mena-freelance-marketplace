# Admin User Setup Instructions

This guide will help you add "azt.2004@hotmail.com" as an admin user for the admin panel.

## Prerequisites

1. Make sure you have Supabase set up and the database schema is applied
2. Have access to your Supabase project dashboard

## Steps to Add Admin User

### Option 1: Create User Through the App (Recommended)

1. **Sign up through the normal user login page:**
   - Open the app
   - Go to the onboarding screen
   - Click "Join as Buyer" (user type doesn't matter for admin)
   - Enter the following details:
     - Full Name: (any name you want, e.g., "Abdul Admin")
     - Email: `azt.2004@hotmail.com`
     - Password: `abdul2003`
   - Complete the signup process

2. **Add admin role via Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the following SQL query:

   ```sql
   -- Add admin role to the user
   INSERT INTO admin_roles (user_id, role, permissions, created_at, updated_at)
   SELECT 
     id,
     'super_admin',
     '{"all": true}'::jsonb,
     NOW(),
     NOW()
   FROM profiles
   WHERE email = 'azt.2004@hotmail.com'
   ON CONFLICT (user_id) DO UPDATE
   SET role = 'super_admin',
       permissions = '{"all": true}'::jsonb,
       updated_at = NOW();
   ```

3. **Login as admin:**
   - You can now login with `azt.2004@hotmail.com` / `abdul2003` through either:
     - The normal user login page (app will detect admin role)
     - The admin panel login page at `/admin/login`

### Option 2: Create User via Supabase Dashboard

1. **Create user in Supabase:**
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Invite user" or "Add user"
   - Enter:
     - Email: `azt.2004@hotmail.com`
     - Password: `abdul2003`
     - Confirm and create the user

2. **Wait for profile to be created:**
   - The database trigger will automatically create a profile for this user
   - This usually happens within a few seconds

3. **Add admin role via SQL:**
   - Go to SQL Editor in Supabase
   - Run the same SQL query as above:

   ```sql
   INSERT INTO admin_roles (user_id, role, permissions)
   SELECT 
     id,
     'super_admin',
     '{"all": true}'::jsonb
   FROM profiles
   WHERE email = 'azt.2004@hotmail.com'
   ON CONFLICT (user_id) DO UPDATE
   SET role = 'super_admin',
       permissions = '{"all": true}'::jsonb,
       updated_at = NOW();
   ```

## Verify Admin Access

After completing the steps above, verify that the admin user is set up correctly:

1. **Check admin role in database:**
   ```sql
   SELECT 
     p.email,
     p.full_name,
     ar.role,
     ar.permissions
   FROM profiles p
   JOIN admin_roles ar ON p.id = ar.user_id
   WHERE p.email = 'azt.2004@hotmail.com';
   ```

2. **Test login:**
   - Go to the app's login page (or `/admin/login`)
   - Login with:
     - Email: `azt.2004@hotmail.com`
     - Password: `abdul2003`
   - You should be redirected to the admin dashboard

## Admin Panel Access

Once logged in, you'll have access to:
- Admin Dashboard (`/admin/(tabs)/dashboard`)
- User Management
- Gig Management
- Disputes
- Orders
- Payments
- Analytics
- And more admin features

## Troubleshooting

### User not found in profiles table
If the user exists in auth.users but not in profiles:
```sql
-- Manually create profile
INSERT INTO profiles (id, email, full_name)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name'
FROM auth.users
WHERE email = 'azt.2004@hotmail.com'
ON CONFLICT (id) DO NOTHING;
```

### Cannot login / Not recognized as admin
Make sure the admin_roles entry exists:
```sql
-- Check if admin role exists
SELECT * FROM admin_roles ar
JOIN profiles p ON ar.user_id = p.id
WHERE p.email = 'azt.2004@hotmail.com';
```

If no results, run the INSERT query from step 2 again.

### Login works but redirected to normal user pages
This means the admin role is not properly set. Verify:
1. The admin_roles table has an entry for this user
2. The role is 'super_admin'
3. Try logging out completely and logging back in

## Admin Roles

The system supports different admin roles:
- `super_admin`: Full access to all features
- `admin`: Most administrative features
- `moderator`: Content moderation features
- `support`: Support and customer service features

The permissions field is a JSONB object that can contain specific permissions:
```json
{
  "all": true,
  "users": true,
  "gigs": true,
  "orders": true,
  "disputes": true,
  "payments": true
}
```

For super_admin, `{"all": true}` grants access to everything.

## Security Notes

1. **Change the password** after first login for better security
2. **Enable two-factor authentication** if available
3. **Keep admin credentials secure** and don't share them
4. **Monitor admin activity logs** regularly for suspicious activity
5. Only create admin accounts for trusted personnel

## Next Steps

After setting up the admin account:
1. Review the admin dashboard features
2. Set up additional admin users if needed (different roles)
3. Configure escrow settings
4. Review and approve pending seller verifications
5. Check system analytics and logs
