# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: MENA Freelance Marketplace
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest to MENA (e.g., West Asia)
4. Click "Create new project" and wait for setup to complete

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project API keys")
   - **anon public** key (under "Project API keys")

## 3. Configure Environment Variables

1. Open the `.env` file in your project root
2. Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url-here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Run the Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, gigs, orders, escrow, etc.)
- Row Level Security (RLS) policies for data protection
- Triggers for automatic wallet creation and timestamp updates
- Indexes for optimized queries

## 5. Set Up Storage (Optional - for file uploads)

1. In your Supabase project, go to **Storage**
2. Create the following buckets:
   - **verification-docs** (for ID/Iqama uploads)
   - **gig-images** (for gig portfolio images)
   - **order-deliveries** (for delivery files)
   - **dispute-evidence** (for dispute files)
3. For each bucket, set up appropriate policies:
   - Users should be able to upload to their own folders
   - Admin can view all files

## 6. Insert Sample Categories (Optional)

Run this SQL in the SQL Editor to add some initial categories:

```sql
INSERT INTO categories (name, name_ar, slug, description) VALUES
  ('Web Development', 'تطوير الويب', 'web-development', 'Professional web development services'),
  ('Mobile Development', 'تطوير الجوال', 'mobile-development', 'iOS and Android app development'),
  ('Graphic Design', 'التصميم الجرافيكي', 'graphic-design', 'Logo, branding, and visual design'),
  ('Digital Marketing', 'التسويق الرقمي', 'digital-marketing', 'SEO, social media, and ads'),
  ('Content Writing', 'كتابة المحتوى', 'content-writing', 'Articles, blogs, and copywriting'),
  ('Video Editing', 'تحرير الفيديو', 'video-editing', 'Professional video editing services'),
  ('Translation', 'الترجمة', 'translation', 'Arabic-English translation services'),
  ('Consulting', 'الاستشارات', 'consulting', 'Business and technical consulting');
```

## 7. Test the Connection

Restart your Expo dev server and check the console for any Supabase connection errors.

## Database Structure Overview

### Core Tables
- **profiles** - User profiles (extends Supabase Auth)
- **seller_verifications** - Saudi seller verification data
- **gigs** - Freelance service listings
- **orders** - Order management with revision tracking
- **order_revisions** - Revision requests and responses

### Escrow & Financial
- **seller_wallets** - Seller balance management
- **withdrawal_requests** - Payout requests
- **transactions** - All financial movements
- **financial_logs** - Admin action audit trail
- **escrow_settings** - Platform configuration

### Communication & Reviews
- **messages** - Order-based chat system
- **reviews** - Gig reviews and ratings
- **disputes** - Dispute management

### Admin
- **admin_roles** - Admin permission management
- **categories** - Gig categories
- **notifications** - User notifications

## Features

✅ **Automatic User Profile Creation** - New signups automatically get a profile
✅ **Seller Wallet Creation** - Wallets created when seller is verified
✅ **Row Level Security** - Users can only access their own data
✅ **Audit Trails** - All financial actions are logged
✅ **Revision System** - Buyers can request revisions on orders
✅ **Escrow Management** - Complete money-holding system
✅ **Real-time Updates** - Use Supabase Realtime for live chat and notifications

## Next Steps

After setting up the database:

1. **Update Auth Context** - Integrate Supabase Auth
2. **Create API Hooks** - Use React Query with Supabase
3. **Add Real-time Subscriptions** - For chat and notifications
4. **Configure Storage** - Set up file upload policies
5. **Add Payment Gateway** - Integrate payment processing

## Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Admin actions require proper role permissions
- ✅ API keys are stored in environment variables
- ⚠️ Never commit `.env` file to version control
- ⚠️ Use service role key only on backend (never in app)

## Support

For issues with Supabase setup:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit [Supabase Discord](https://discord.supabase.com)
