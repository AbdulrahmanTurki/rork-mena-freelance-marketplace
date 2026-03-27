-- ============================================
-- COMPREHENSIVE FIX FOR ALL WALLET ERRORS
-- ============================================
-- Run this script in your Supabase SQL Editor to fix all wallet-related issues
-- This includes RLS policies, missing columns, and ensures data integrity

-- =============================================
-- PART 1: ADD MISSING COLUMNS TO ORDERS TABLE
-- =============================================

-- Add total_amount column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10, 2);
    UPDATE orders SET total_amount = gig_price WHERE total_amount IS NULL;
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
    UPDATE orders SET due_date = created_at + INTERVAL '7 days' WHERE due_date IS NULL;
    RAISE NOTICE 'Added due_date column to orders table';
  ELSE
    RAISE NOTICE 'due_date column already exists';
  END IF;
END $$;

-- Update orders status constraint to include pending_delivery
DO $$
BEGIN
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

-- =============================================
-- PART 2: FIX SELLER_WALLETS RLS POLICIES
-- =============================================

-- Drop existing policies that reference non-existent 'role' column
DROP POLICY IF EXISTS "seller_wallets_select_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_insert_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_update_policy" ON seller_wallets;
DROP POLICY IF EXISTS "Sellers can view own wallet" ON seller_wallets;

-- Create new policies using admin_roles table
CREATE POLICY "seller_wallets_select_policy" ON seller_wallets
FOR SELECT
USING (
  seller_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

CREATE POLICY "seller_wallets_insert_policy" ON seller_wallets
FOR INSERT
WITH CHECK (
  seller_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

CREATE POLICY "seller_wallets_update_policy" ON seller_wallets
FOR UPDATE
USING (
  seller_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- =============================================
-- PART 3: FIX WITHDRAWAL_REQUESTS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can create withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_select_policy" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_insert_policy" ON withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_update_policy" ON withdrawal_requests;

CREATE POLICY "withdrawal_requests_select_policy" ON withdrawal_requests
FOR SELECT
USING (
  seller_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

CREATE POLICY "withdrawal_requests_insert_policy" ON withdrawal_requests
FOR INSERT
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "withdrawal_requests_update_policy" ON withdrawal_requests
FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- =============================================
-- PART 4: FIX TRANSACTIONS RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;
DROP POLICY IF EXISTS "transactions_select_policy" ON transactions;

CREATE POLICY "transactions_select_policy" ON transactions
FOR SELECT
USING (
  from_user_id = auth.uid() 
  OR 
  to_user_id = auth.uid()
  OR
  EXISTS (SELECT 1 FROM admin_roles WHERE admin_roles.user_id = auth.uid())
);

-- =============================================
-- PART 5: ENSURE WALLET CREATION FUNCTION IS CORRECT
-- =============================================

DROP FUNCTION IF EXISTS create_seller_wallet() CASCADE;

CREATE OR REPLACE FUNCTION create_seller_wallet()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO seller_wallets (seller_id, available_balance, pending_balance, total_earned)
    VALUES (NEW.user_id, 0, 0, 0)
    ON CONFLICT (seller_id) DO NOTHING;
    
    RAISE LOG 'Created wallet for seller: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS create_wallet_on_approval ON seller_verifications;

CREATE TRIGGER create_wallet_on_approval
AFTER INSERT OR UPDATE ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION create_seller_wallet();

-- =============================================
-- PART 6: CREATE WALLETS FOR EXISTING APPROVED SELLERS
-- =============================================

INSERT INTO seller_wallets (seller_id, available_balance, pending_balance, total_earned)
SELECT 
  sv.user_id,
  0,
  0,
  0
FROM seller_verifications sv
WHERE sv.status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM seller_wallets sw WHERE sw.seller_id = sv.user_id
)
ON CONFLICT (seller_id) DO NOTHING;

-- =============================================
-- PART 7: VERIFICATION AND SUMMARY
-- =============================================

DO $$
DECLARE
  approved_sellers INTEGER;
  wallets_created INTEGER;
  missing_wallets INTEGER;
BEGIN
  SELECT COUNT(*) INTO approved_sellers 
  FROM seller_verifications 
  WHERE status = 'approved';
  
  SELECT COUNT(*) INTO wallets_created 
  FROM seller_wallets;
  
  SELECT COUNT(*) INTO missing_wallets
  FROM seller_verifications sv
  WHERE sv.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM seller_wallets sw WHERE sw.seller_id = sv.user_id
  );
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'WALLET FIX VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Approved sellers: %', approved_sellers;
  RAISE NOTICE 'Wallets created: %', wallets_created;
  RAISE NOTICE 'Missing wallets: %', missing_wallets;
  RAISE NOTICE '========================================';
  
  IF missing_wallets > 0 THEN
    RAISE WARNING 'ACTION REQUIRED: % approved sellers still do not have wallets!', missing_wallets;
  ELSE
    RAISE NOTICE 'SUCCESS: All approved sellers have wallets!';
  END IF;
END $$;
