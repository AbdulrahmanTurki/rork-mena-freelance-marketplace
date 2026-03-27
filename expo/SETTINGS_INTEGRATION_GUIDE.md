# Settings Pages Integration with User Account

## Overview
The settings pages have been updated to connect to your actual user account data stored in Supabase instead of using hardcoded mock data.

## What Was Updated

### 1. Database Schema (`types/database.types.ts`)
Added two new tables to the type definitions:
- **user_preferences**: Stores user notification and privacy preferences
- **payment_methods**: Stores user payment methods (cards, bank accounts)

### 2. New Hooks Created

#### `hooks/useUserPreferences.ts`
- `useUserPreferences(userId)` - Fetches user preferences, creates defaults if none exist
- `useUpdateUserPreferences()` - Updates user preferences

#### `hooks/usePaymentMethods.ts`
- `usePaymentMethods(userId)` - Fetches all payment methods for a user
- `useAddPaymentMethod()` - Adds a new payment method
- `useUpdatePaymentMethod()` - Updates an existing payment method (e.g., set as default)
- `useDeletePaymentMethod()` - Deletes a payment method

### 3. Updated Settings Pages

#### `app/settings.tsx`
- Now fetches and displays actual user notification preferences
- All notification toggles (Push, Email, Order Updates, Promotions) are connected to the database
- Changes are saved immediately when toggles are switched

#### `app/settings/edit-profile.tsx`
- Fetches user profile data from Supabase
- Displays actual user information (name, email, phone, city)
- Updates are saved to the database
- Shows loading state while fetching
- Email field is read-only (email updates should be handled separately via auth)
- Includes proper error handling and success messages

#### `app/settings/change-password.tsx`
- Uses Supabase Auth to change password
- Properly validates password requirements
- Shows loading state during password change
- Includes proper error handling

#### `app/settings/privacy.tsx`
- Connected to user preferences for privacy settings
- All privacy toggles (Online Status, Last Seen, Profile Visibility, Show Email, Show Phone, Allow Messages, Show Activity) are connected to the database
- Changes are saved immediately

#### `app/settings/payment-methods.tsx`
- **TODO**: Need to complete integration with payment methods hooks
- Currently shows mock data

## What You Need to Do in Supabase

### Step 1: Run the SQL Migration
Execute the SQL file `supabase/user-preferences-schema.sql` in your Supabase SQL Editor:

```sql
-- This will create:
-- 1. user_preferences table
-- 2. payment_methods table
-- 3. RLS policies for both tables
-- 4. Indexes for performance
-- 5. Triggers for automatic user preferences creation
```

You can access the SQL Editor at:
https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/sql

### Step 2: Verify Tables Were Created
Check in Supabase Dashboard > Table Editor that you now have:
- `user_preferences`
- `payment_methods`

### Step 3: Test the Integration
1. Log in to your app
2. Go to Settings
3. Toggle any notification preference - it should save to the database
4. Go to Edit Profile - it should load your actual user data
5. Update your profile - changes should be saved
6. Go to Privacy Settings - toggle any setting - it should save

## Features Now Working

✅ **Notification Preferences**
- Push Notifications (on/off)
- Email Notifications (on/off)
- Order Updates (on/off)
- Promotions & Offers (on/off)

✅ **Profile Editing**
- Full Name
- Phone Number
- City
- Profile avatar (displays user initials if no avatar)

✅ **Password Change**
- Connected to Supabase Auth
- Validates password requirements
- Proper error handling

✅ **Privacy Settings**
- Show Online Status
- Show Last Seen
- Profile Visibility
- Show Email on Profile
- Show Phone on Profile
- Allow Messages
- Show Activity

## Still Using Mock Data

⚠️ **Payment Methods** - You'll need to complete the integration for:
- `app/settings/payment-methods.tsx`
- `app/settings/add-payment-method.tsx`

These pages exist but need to be connected to the `usePaymentMethods` hooks.

⚠️ **Two-Factor Authentication** - This is currently a UI-only feature and not connected to actual 2FA functionality.

## Database Structure

### user_preferences Table
```
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- push_notifications (boolean)
- email_notifications (boolean)
- order_updates (boolean)
- promotions (boolean)
- show_online_status (boolean)
- show_last_seen (boolean)
- profile_visibility (boolean)
- show_email (boolean)
- show_phone (boolean)
- allow_messages (boolean)
- show_activity (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### payment_methods Table
```
- id (UUID, PK)
- user_id (UUID, FK to auth.users)
- type (text: 'card' or 'bank')
- last4 (text)
- brand (text)
- expiry_month (integer)
- expiry_year (integer)
- is_default (boolean)
- stripe_payment_method_id (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

## Security

- Both tables have Row Level Security (RLS) enabled
- Users can only view and modify their own data
- Automatic triggers create default preferences when a new user signs up

## Testing Checklist

After running the SQL migration, test:

- [ ] Sign up as a new user - preferences should be auto-created
- [ ] Toggle notification settings - should save
- [ ] Edit profile information - should save
- [ ] Change password - should work
- [ ] Toggle privacy settings - should save
- [ ] Log out and log back in - settings should persist

## Troubleshooting

If preferences don't load:
1. Check Supabase logs for errors
2. Verify RLS policies are enabled
3. Check that the user is authenticated
4. Look for console errors in the app

If updates don't save:
1. Check network tab for failed requests
2. Verify user has permission (RLS policies)
3. Check Supabase Auth session is valid
4. Look at console logs for mutation errors
