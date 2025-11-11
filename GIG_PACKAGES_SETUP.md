# Gig Packages Setup Instructions

This guide will help you add the packages column to your gigs table so that premium packages can be saved when creating or editing gigs.

## Problem
Currently, when creating or editing gigs, only the basic package information (price and delivery_time) is being saved. The standard and premium packages are not being persisted in the database.

## Solution
Add a `packages` JSONB column to the `gigs` table to store all pricing tiers.

## Steps

### 1. Run the SQL Migration

Go to your Supabase project dashboard:
1. Navigate to the SQL Editor
2. Open the file `supabase/add-gig-packages.sql` from your project
3. Copy and paste the SQL into the SQL Editor
4. Click "Run" to execute the migration

The SQL will:
- Add a `packages` column of type JSONB to the `gigs` table
- Set a default value of an empty array
- Add a comment explaining the expected structure

### 2. Verify the Migration

After running the migration, verify it was successful:

```sql
-- Check the gigs table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'gigs' AND column_name = 'packages';
```

You should see:
- column_name: packages
- data_type: jsonb
- is_nullable: YES
- column_default: '[]'::jsonb

### 3. Test Creating a Gig

1. Log in as a seller
2. Create a new gig
3. Fill in the pricing for:
   - Basic package (required)
   - Standard package (optional)
   - Premium package (optional)
4. Add features to each package
5. Publish the gig

### 4. Test Editing a Gig

1. Go to your gigs list
2. Edit a previously created gig
3. Verify that all saved package information loads correctly
4. Make changes to any package
5. Save the changes
6. Edit again to verify the changes persisted

## Package Data Structure

The `packages` column stores an array of package objects with this structure:

```json
[
  {
    "name": "basic",
    "price": 100,
    "deliveryDays": 3,
    "description": "Basic package description",
    "features": ["Feature 1", "Feature 2", "Feature 3"]
  },
  {
    "name": "standard",
    "price": 200,
    "deliveryDays": 5,
    "description": "Standard package description",
    "features": ["All basic features", "Feature 4", "Feature 5"]
  },
  {
    "name": "premium",
    "price": 300,
    "deliveryDays": 7,
    "description": "Premium package description",
    "features": ["All standard features", "Feature 6", "Feature 7", "Priority support"]
  }
]
```

## What Changed

### Database Schema
- Added `packages: Json | null` field to the gigs table types

### Create Gig Screen
- Now collects all package information (basic, standard, premium)
- Filters out packages with empty price or delivery days
- Sends packages array to the database

### Edit Gig Screen
- Loads all saved packages from the database
- Falls back to basic package data (price, delivery_time) if no packages are saved
- Preserves all package information when saving
- Maintains features for each package

## Troubleshooting

### Packages Not Saving
If packages are still not saving after running the migration:

1. Check browser console for errors
2. Verify the migration ran successfully in Supabase
3. Check if there are any RLS (Row Level Security) policies blocking the update

### Packages Not Loading
If packages don't load when editing:

1. Check if the gig was created before the migration
2. Old gigs will only have `price` and `delivery_time` fields
3. The edit screen will load basic package from these fields
4. Once you save, the packages will be stored properly

### Data Not Persisting Between Edits
If you save changes but they disappear on the next edit:

1. Check the browser console for errors during save
2. Verify the update mutation is including the packages field
3. Check Supabase logs for any errors during the update query

## Migration Rollback

If you need to rollback this change:

```sql
-- Remove the packages column
ALTER TABLE gigs DROP COLUMN IF EXISTS packages;
```

Note: This will delete all saved package data.
