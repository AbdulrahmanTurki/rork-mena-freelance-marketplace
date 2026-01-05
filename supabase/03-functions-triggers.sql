-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- Run this after 02-rls-policies.sql
-- =============================================================================

-- =============================================================================
-- CLEAN UP OLD TRIGGERS AND FUNCTIONS
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_seller_verified ON seller_verifications CASCADE;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles CASCADE;
DROP TRIGGER IF EXISTS update_seller_verifications_updated_at ON seller_verifications CASCADE;
DROP TRIGGER IF EXISTS update_gigs_updated_at ON gigs CASCADE;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders CASCADE;
DROP TRIGGER IF EXISTS update_seller_wallets_updated_at ON seller_wallets CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_seller_wallet() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =============================================================================
-- FUNCTION: Update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCTION: Handle new user signup
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'buyer'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCTION: Create seller wallet on verification approval
-- =============================================================================

CREATE OR REPLACE FUNCTION create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO seller_wallets (seller_id, available_balance, pending_balance, total_earned)
    VALUES (NEW.user_id, 0, 0, 0)
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in create_seller_wallet: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- APPLY TRIGGERS
-- =============================================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Trigger for seller wallet creation
CREATE TRIGGER on_seller_verified
  AFTER UPDATE ON seller_verifications
  FOR EACH ROW 
  EXECUTE FUNCTION create_seller_wallet();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_verifications_updated_at 
  BEFORE UPDATE ON seller_verifications
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at 
  BEFORE UPDATE ON gigs
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_wallets_updated_at 
  BEFORE UPDATE ON seller_wallets
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ FUNCTIONS AND TRIGGERS SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'All functions and triggers created successfully';
  RAISE NOTICE 'Next step: Run 04-create-admin.sql';
  RAISE NOTICE '====================================================';
END $$;
