# Categories Setup Guide

## Problem
Categories are not available in the database, which prevents users from creating services.

## Solution
Run the seed script to populate the categories table with default categories.

## Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/seed-categories.sql`
5. Click **Run** to execute the script

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db execute -f supabase/seed-categories.sql
```

## What Categories Are Added

The script adds 10 default categories:
1. Graphic Design
2. Web Development
3. Mobile Apps
4. Writing & Translation
5. Video & Animation
6. Digital Marketing
7. Music & Audio
8. Business Consulting
9. Data & Analytics
10. Photography

Each category includes:
- English name
- Arabic name
- URL-friendly slug
- Icon name (from Lucide icons)
- Description

## Verification

After running the script, you can verify the categories were added:

1. Go to Supabase Dashboard → Table Editor
2. Select the `categories` table
3. You should see 10 rows

Or run this query in the SQL Editor:

```sql
SELECT name, slug FROM categories ORDER BY name;
```

## Next Steps

After adding categories, you can:
- Create new services with category selection
- View services filtered by category
- Admins can add more categories from the admin panel
