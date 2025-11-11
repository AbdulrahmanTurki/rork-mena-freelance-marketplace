-- ============================================
-- ADD MISSING COLUMNS TO ORDERS TABLE
-- ============================================
-- This script adds missing columns that are referenced in the code

-- Add total_amount column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2);
    
    -- Update existing orders with total_amount from gig_price
    UPDATE orders SET total_amount = gig_price WHERE total_amount IS NULL;
    
    -- Make it NOT NULL after populating
    ALTER TABLE orders ALTER COLUMN total_amount SET NOT NULL;
    
    RAISE NOTICE 'Added total_amount column to orders table';
  ELSE
    RAISE NOTICE 'total_amount column already exists';
  END IF;
END $$;

-- Add due_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN due_date TIMESTAMPTZ;
    
    -- Set due date to 7 days from created_at for existing orders
    UPDATE orders 
    SET due_date = created_at + INTERVAL '7 days'
    WHERE due_date IS NULL;
    
    RAISE NOTICE 'Added due_date column to orders table';
  ELSE
    RAISE NOTICE 'due_date column already exists';
  END IF;
END $$;

-- Add pending_delivery status if it doesn't exist
DO $$
BEGIN
  -- Check if the constraint exists and update it
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
  
  ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN (
    'pending_payment',
    'in_progress',
    'pending_delivery',
    'delivered',
    'revision_requested',
    'completed',
    'cancelled',
    'disputed',
    'refunded'
  ));
  
  RAISE NOTICE 'Updated orders status constraint';
END $$;
