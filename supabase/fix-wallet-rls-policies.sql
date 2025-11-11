-- ============================================
-- FIX WALLET RLS POLICIES
-- ============================================
-- This script fixes the RLS policies for seller_wallets that incorrectly
-- reference a 'role' column in the profiles table.

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "seller_wallets_select_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_insert_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_update_policy" ON seller_wallets;
DROP POLICY IF EXISTS "Sellers can view own wallet" ON seller_wallets;

-- Step 2: Create proper RLS policies for seller_wallets

-- Allow sellers to view their own wallet
CREATE POLICY "seller_wallets_select_policy" ON seller_wallets
FOR SELECT
USING (
  seller_id = auth.uid()
  OR
  -- Check if user is an admin by looking in admin_roles table
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Allow system to insert wallets (used by triggers)
-- Also allow admins to manually create wallets
CREATE POLICY "seller_wallets_insert_policy" ON seller_wallets
FOR INSERT
WITH CHECK (
  seller_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Allow sellers and admins to update wallets
CREATE POLICY "seller_wallets_update_policy" ON seller_wallets
FOR UPDATE
USING (
  seller_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Step 3: Update withdrawal_requests policies if they have similar issues
DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON withdrawal_requests;
DROP POLICY IF EXISTS "Sellers can create withdrawals" ON withdrawal_requests;

CREATE POLICY "withdrawal_requests_select_policy" ON withdrawal_requests
FOR SELECT
USING (
  seller_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

CREATE POLICY "withdrawal_requests_insert_policy" ON withdrawal_requests
FOR INSERT
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "withdrawal_requests_update_policy" ON withdrawal_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Step 4: Update transactions policies if needed
DROP POLICY IF EXISTS "Users can view their transactions" ON transactions;

CREATE POLICY "transactions_select_policy" ON transactions
FOR SELECT
USING (
  from_user_id = auth.uid() 
  OR 
  to_user_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM admin_roles 
    WHERE admin_roles.user_id = auth.uid()
  )
);

-- Step 5: Verify all approved sellers have wallets
DO $$
DECLARE
  missing_wallets INTEGER;
BEGIN
  -- Create wallets for approved sellers without one
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
  
  -- Check if any are still missing
  SELECT COUNT(*) INTO missing_wallets
  FROM seller_verifications sv
  WHERE sv.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM seller_wallets sw WHERE sw.seller_id = sv.user_id
  );
  
  IF missing_wallets > 0 THEN
    RAISE WARNING 'There are still % approved sellers without wallets', missing_wallets;
  ELSE
    RAISE NOTICE 'All approved sellers have wallets';
  END IF;
END $$;
