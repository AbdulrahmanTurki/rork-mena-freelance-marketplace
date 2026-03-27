# Database Setup Instructions

Complete SQL scripts for setting up the freelance marketplace database with proper user, seller, and admin functionality.

## 📋 Prerequisites

- Access to your Supabase project dashboard
- SQL Editor access in Supabase

## 🚀 Setup Steps

Run these scripts **in order** in your Supabase SQL Editor:

### 1. Complete Schema (Required)
**File:** `01-complete-schema.sql`

Creates all tables:
- profiles
- seller_verifications
- categories
- gigs
- orders
- order_revisions
- messages
- seller_wallets
- withdrawal_requests
- transactions
- financial_logs
- escrow_settings
- reviews
- disputes
- admin_roles
- notifications
- user_preferences
- payment_methods

### 2. RLS Policies (Required)
**File:** `02-rls-policies.sql`

Sets up Row Level Security policies for:
- User data protection
- Seller-specific access
- Admin role permissions
- Public read access where appropriate

### 3. Functions & Triggers (Required)
**File:** `03-functions-triggers.sql`

Creates:
- Auto-create profile on user signup
- Auto-create seller wallet on verification
- Auto-update timestamps
- Error handling

### 4. Create Admin User (Required)
**File:** `04-create-admin.sql`

**⚠️ IMPORTANT: Edit this file before running!**

Change these values at the top of the file:
```sql
admin_email TEXT := 'admin_final@gmail.com';  -- CHANGE THIS
admin_password TEXT := 'Admin@123';            -- CHANGE THIS
```

Creates:
- Admin user in auth.users
- Admin profile
- Admin role with super_admin permissions
- Verification checks

### 5. Seed Categories (Optional)
**File:** `05-seed-categories.sql`

Adds default categories:
- Graphic Design
- Digital Marketing
- Writing & Translation
- Video & Animation
- Music & Audio
- Programming & Tech
- Business
- Lifestyle

## ✅ Verification

After running all scripts, verify the setup:

1. **Check Admin User:**
```sql
SELECT 
  u.email,
  p.full_name,
  ar.role,
  ar.permissions
FROM auth.users u
JOIN profiles p ON p.id = u.id
JOIN admin_roles ar ON ar.user_id = u.id
WHERE u.email = 'your_admin_email@gmail.com';
```

2. **Check Tables:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

3. **Check RLS Policies:**
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 🔐 Admin Login

After setup:
1. Use the email and password you set in `04-create-admin.sql`
2. The app will detect the admin role and redirect to `/admin/dashboard`
3. Change your password after first login!

## 🐛 Troubleshooting

### Admin not redirecting to admin panel?

1. **Verify admin role exists:**
```sql
SELECT * FROM admin_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your_email'
);
```

2. **Check AuthContext logs:**
- Open browser console
- Look for `[AuthContext] User is an admin` message
- Should show `type: "admin"` in user state

3. **Clear and re-run scripts:**
```sql
-- Run 04-create-admin.sql again
```

### Profile loading errors?

Check Supabase project is not paused:
1. Go to Supabase Dashboard
2. Check project status
3. Unpause if needed

### Can't login?

1. **Verify user exists:**
```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your_email';
```

2. **Reset password if needed:**
```sql
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword123', gen_salt('bf'))
WHERE email = 'your_email';
```

## 📚 Database Structure

### User Types
- **buyer**: Regular users who purchase services
- **seller**: Verified freelancers who offer services
- **admin**: Platform administrators (via admin_roles table)

### Key Relationships
```
auth.users (Supabase Auth)
  └── profiles (User info)
       ├── admin_roles (Admin permissions)
       ├── seller_verifications (Seller KYC)
       │    └── seller_wallets (Seller earnings)
       ├── gigs (Services offered)
       ├── orders (Buyer/Seller transactions)
       └── messages (Communications)
```

### Admin Permissions Structure
```json
{
  "users": {"view": true, "edit": true, "delete": true},
  "orders": {"view": true, "edit": true, "cancel": true},
  "gigs": {"view": true, "edit": true, "delete": true},
  "disputes": {"view": true, "resolve": true},
  "financials": {"view": true, "edit": true},
  "settings": {"view": true, "edit": true}
}
```

## 🔄 Updates & Maintenance

To update an existing database:
1. Backup your data first
2. Run only the scripts that need updating
3. Test thoroughly before going live

## 📞 Support

If you encounter issues:
1. Check console logs in browser dev tools
2. Check Supabase logs in dashboard
3. Verify all scripts ran without errors
4. Check that your Supabase project is active
