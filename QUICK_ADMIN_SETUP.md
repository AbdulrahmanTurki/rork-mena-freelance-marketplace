# Quick Start: Add Admin User

## Step 1: Create User Account

Open your app and sign up with:
- Email: `azt.2004@hotmail.com`
- Password: `abdul2003`
- Name: (anything you want)

## Step 2: Make User Admin

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Paste this SQL:

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

3. Click "Run"

## Step 3: Login

Login with:
- Email: `azt.2004@hotmail.com`
- Password: `abdul2003`

Done! You now have admin access.

## Alternative: Create User via Supabase

If you prefer to create the user through Supabase instead of the app:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email `azt.2004@hotmail.com` and password `abdul2003`
4. Then follow Step 2 above

---

**Need help?** See `ADMIN_SETUP_INSTRUCTIONS.md` for detailed troubleshooting.
