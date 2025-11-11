-- Add packages column to gigs table to store pricing tiers
ALTER TABLE gigs 
ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the structure
COMMENT ON COLUMN gigs.packages IS 'Array of pricing packages. Each package should have: name (basic/standard/premium), price, delivery_days, description, features[]';
