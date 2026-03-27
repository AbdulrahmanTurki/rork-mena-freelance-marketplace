# Database Seeding Guide

This script will help you populate your Supabase database with sample data.

## Prerequisites

1. Make sure you've run the schema from `supabase/schema.sql` in your Supabase SQL Editor
2. Have your Supabase URL and anon key configured in `.env`

## Seed Categories

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert categories
INSERT INTO categories (name, name_ar, slug, icon, description) VALUES
  ('Graphic Design', 'التصميم الجرافيكي', 'graphic-design', 'palette', 'Professional graphic design services'),
  ('Content Writing', 'كتابة المحتوى', 'content-writing', 'pen-tool', 'High-quality content creation'),
  ('Translation', 'الترجمة', 'translation', 'languages', 'Professional translation services'),
  ('Social Media', 'وسائل التواصل', 'social-media', 'share-2', 'Social media management'),
  ('Digital Marketing', 'التسويق الرقمي', 'digital-marketing', 'trending-up', 'Marketing and SEO services'),
  ('Video Editing', 'تحرير الفيديو', 'video-editing', 'video', 'Professional video editing'),
  ('Web Development', 'تطوير المواقع', 'web-development', 'code', 'Full-stack web development'),
  ('Voice Over', 'التعليق الصوتي', 'voice-over', 'mic', 'Professional voice over services'),
  ('Photography', 'التصوير الفوتوغرافي', 'photography', 'camera', 'Professional photography'),
  ('Music & Audio', 'الموسيقى والصوت', 'music-audio', 'music', 'Music production and audio editing'),
  ('Animation', 'الرسوم المتحركة', 'animation', 'film', '2D and 3D animation'),
  ('Data Entry', 'إدخال البيانات', 'data-entry', 'database', 'Accurate data entry services'),
  ('Virtual Assistant', 'المساعد الافتراضي', 'virtual-assistant', 'headphones', 'Virtual assistant services'),
  ('Mobile Apps', 'تطبيقات الجوال', 'mobile-apps', 'smartphone', 'iOS and Android development'),
  ('SEO Services', 'خدمات السيو', 'seo-services', 'search', 'Search engine optimization'),
  ('Consulting', 'الاستشارات', 'consulting', 'briefcase', 'Business consulting'),
  ('Legal Services', 'الخدمات القانونية', 'legal-services', 'file-text', 'Legal consultation'),
  ('Accounting', 'المحاسبة', 'accounting', 'calculator', 'Accounting services'),
  ('E-Commerce', 'التجارة الإلكترونية', 'e-commerce', 'shopping-cart', 'E-commerce solutions'),
  ('Others', 'أخرى', 'others', 'more-horizontal', 'Other services');
```

## Create Test Users

To create test users, you need to use Supabase Auth. You can either:

1. **Sign up through the app** - The handle_new_user() trigger will automatically create profiles
2. **Create users via Supabase Dashboard** - Go to Authentication > Users > Invite user

### Sample Test Accounts

After creating users through the app or dashboard, you can update their profiles:

```sql
-- Update a user to be a seller (replace USER_ID with actual UUID from auth.users)
UPDATE profiles 
SET 
  user_type = 'seller',
  full_name = 'Ahmed Hassan',
  full_name_arabic = 'أحمد حسن',
  city = 'Riyadh',
  mobile_number = '+966501234567'
WHERE id = 'USER_ID';

-- Create seller verification
INSERT INTO seller_verifications (user_id, status)
VALUES ('USER_ID', 'approved');

-- This will automatically create a seller wallet due to the trigger
```

## Create Sample Gigs

```sql
-- Get category IDs first
SELECT id, name FROM categories;

-- Create gigs (replace SELLER_ID with actual user ID and CATEGORY_ID with actual category ID)
INSERT INTO gigs (
  seller_id,
  category_id,
  title,
  description,
  price,
  delivery_time,
  images,
  tags,
  revisions_included,
  rating,
  reviews_count,
  is_active
) VALUES
(
  'SELLER_ID',
  'CATEGORY_ID',
  'I will design a modern Arabic logo for your brand',
  'Transform your brand with a stunning, culturally resonant logo designed specifically for the MENA market.',
  300,
  5,
  ARRAY['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop'],
  ARRAY['logo', 'arabic', 'branding', 'design'],
  2,
  4.9,
  127,
  true
),
(
  'SELLER_ID',
  'CATEGORY_ID',
  'I will write engaging Arabic content for your website',
  'Need high-quality Arabic content that resonates with your audience? I create compelling, SEO-optimized content.',
  150,
  3,
  ARRAY['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop'],
  ARRAY['content', 'arabic', 'writing', 'seo'],
  2,
  5.0,
  89,
  true
);
```

## Create Sample Orders

```sql
-- Create order (replace BUYER_ID, SELLER_ID, GIG_ID with actual IDs)
INSERT INTO orders (
  order_number,
  buyer_id,
  seller_id,
  gig_id,
  gig_title,
  gig_price,
  status,
  revisions_allowed,
  escrow_amount,
  platform_fee,
  seller_net_amount
) VALUES
(
  'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random() * 10000)::text,
  'BUYER_ID',
  'SELLER_ID',
  'GIG_ID',
  'Logo Design Package',
  300,
  'in_progress',
  2,
  300,
  30,
  270
);
```

## Verify Setup

Run these queries to check your data:

```sql
-- Check categories
SELECT count(*) as category_count FROM categories;

-- Check profiles
SELECT id, email, full_name, user_type FROM profiles;

-- Check gigs
SELECT id, title, price, seller_id FROM gigs;

-- Check orders
SELECT id, order_number, status FROM orders;

-- Check seller wallets
SELECT seller_id, available_balance, total_earned FROM seller_wallets;
```

## Notes

- The first user you create should be made an admin for testing admin features
- Make sure to create at least 2 users (one buyer, one seller) to test the full flow
- Categories are required before creating gigs
- Orders can only be created between existing users and gigs
- Seller wallets are automatically created when a seller is verified

## Admin Setup

To make a user an admin:

```sql
-- Replace USER_ID with the actual user ID
INSERT INTO admin_roles (user_id, role, permissions)
VALUES (
  'USER_ID',
  'super_admin',
  '{"all": true}'::jsonb
);
```

## Quick Start Script

For the fastest setup, create 1 buyer and 1 seller through the app, then run:

```sql
-- Get the user IDs from profiles
SELECT id, email, user_type FROM profiles;

-- Make the first user a seller (if not already)
UPDATE profiles SET user_type = 'seller' WHERE email = 'seller@example.com';

-- Verify the seller
INSERT INTO seller_verifications (user_id, status)
SELECT id, 'approved' FROM profiles WHERE email = 'seller@example.com'
ON CONFLICT (user_id) DO UPDATE SET status = 'approved';

-- The seller wallet will be created automatically by trigger
```

Now you can use the app normally and create gigs through the UI!
