-- ============================================
-- COMPREHENSIVE SELLER WALLET FIX
-- ============================================
-- This script fixes all wallet-related issues including RLS policies,
-- triggers, and ensures all approved sellers have wallets.

-- Step 1: Drop existing policies to recreate them
DROP POLICY IF EXISTS "seller_wallets_select_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_insert_policy" ON seller_wallets;
DROP POLICY IF EXISTS "seller_wallets_update_policy" ON seller_wallets;

-- Step 2: Create proper RLS policies for seller_wallets
-- Allow sellers to view their own wallet
CREATE POLICY "seller_wallets_select_policy" ON seller_wallets
FOR SELECT
USING (
  seller_id = auth.uid()
  OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Allow system to insert wallets (this will be used by triggers)
CREATE POLICY "seller_wallets_insert_policy" ON seller_wallets
FOR INSERT
WITH CHECK (true);

-- Allow sellers and admins to update wallets
CREATE POLICY "seller_wallets_update_policy" ON seller_wallets
FOR UPDATE
USING (
  seller_id = auth.uid()
  OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Step 3: Recreate the function with SECURITY DEFINER to bypass RLS
DROP FUNCTION IF EXISTS create_seller_wallet() CASCADE;

CREATE OR REPLACE FUNCTION create_seller_wallet()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a seller verification is approved, create their wallet
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Insert the wallet if it doesn't exist
    INSERT INTO seller_wallets (seller_id, available_balance, pending_balance, total_earned)
    VALUES (NEW.user_id, 0, 0, 0)
    ON CONFLICT (seller_id) DO NOTHING;
    
    RAISE LOG 'Created wallet for seller: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the trigger
DROP TRIGGER IF EXISTS create_wallet_on_approval ON seller_verifications;

CREATE TRIGGER create_wallet_on_approval
AFTER INSERT OR UPDATE ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION create_seller_wallet();

-- Step 5: Create wallets for all approved sellers who don't have one yet
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

-- Step 6: Verify the setup
DO $$
DECLARE
  approved_count INTEGER;
  wallet_count INTEGER;
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO approved_count 
  FROM seller_verifications 
  WHERE status = 'approved';
  
  SELECT COUNT(*) INTO wallet_count 
  FROM seller_wallets;
  
  SELECT COUNT(*) INTO missing_count
  FROM seller_verifications sv
  WHERE sv.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM seller_wallets sw WHERE sw.seller_id = sv.user_id
  );
  
  RAISE NOTICE 'Verification Summary:';
  RAISE NOTICE '  - Approved sellers: %', approved_count;
  RAISE NOTICE '  - Existing wallets: %', wallet_count;
  RAISE NOTICE '  - Missing wallets: %', missing_count;
  
  IF missing_count > 0 THEN
    RAISE WARNING 'There are still % approved sellers without wallets!', missing_count;
  ELSE
    RAISE NOTICE 'All approved sellers have wallets!';
  END IF;
END $$;

-- Step 7: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON seller_wallets TO authenticated;
GRANT USAGE ON SEQUENCE seller_wallets_id_seq TO authenticated;

RAISE NOTICE 'Seller wallet fix completed successfully!';
