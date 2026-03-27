-- Fix the create_seller_wallet function to run with elevated privileges
-- This allows the trigger to bypass RLS policies
CREATE OR REPLACE FUNCTION create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO seller_wallets (seller_id)
    VALUES (NEW.user_id)
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
