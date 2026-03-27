-- =============================================================================
-- COMPLETE UNIFIED SCHEMA FOR FREELANCE MARKETPLACE
-- Includes all tables for buyers, sellers, and admins
-- This script is IDEMPOTENT - safe to run multiple times
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- DROP OLD TRIGGERS AND FUNCTIONS (Clean slate)
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
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  full_name_arabic TEXT,
  national_id TEXT UNIQUE,
  iqama_number TEXT UNIQUE,
  date_of_birth DATE,
  nationality TEXT,
  gender TEXT,
  mobile_number TEXT,
  mobile_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  city TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('buyer', 'seller')) DEFAULT 'buyer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  id_front_url TEXT,
  id_back_url TEXT,
  permit_number TEXT,
  permit_expiration_date DATE,
  permit_document_url TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  rejection_count INTEGER DEFAULT 0,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  delivery_time INTEGER NOT NULL,
  images TEXT[],
  tags TEXT[],
  revisions_included INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  packages JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || substr(uuid_generate_v4()::text, 1, 8)),
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
  gig_title TEXT NOT NULL,
  gig_price DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN (
    'pending_payment',
    'in_progress', 
    'delivered',
    'revision_requested',
    'completed',
    'cancelled',
    'disputed',
    'refunded'
  )) DEFAULT 'pending_payment',
  delivery_files TEXT[],
  delivered_at TIMESTAMPTZ,
  revisions_allowed INTEGER DEFAULT 0,
  revisions_used INTEGER DEFAULT 0,
  escrow_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  seller_net_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  auto_release_at TIMESTAMPTZ,
  is_frozen BOOLEAN DEFAULT false,
  frozen_until TIMESTAMPTZ,
  frozen_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id),
  revision_number INTEGER NOT NULL,
  request_message TEXT NOT NULL,
  response_message TEXT,
  response_files TEXT[],
  responded_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  available_balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  last_withdrawal TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES seller_wallets(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payout_method TEXT NOT NULL,
  payout_details JSONB,
  status TEXT CHECK (status IN ('pending', 'approved', 'declined', 'completed')) DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES profiles(id),
  decline_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type TEXT CHECK (transaction_type IN (
    'order_payment',
    'release_to_seller',
    'partial_refund',
    'refund_to_buyer',
    'split_payment',
    'withdrawal',
    'platform_fee'
  )) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES profiles(id),
  reason TEXT,
  details JSONB,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2),
  reason TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS escrow_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clearance_period_days INTEGER DEFAULT 7,
  auto_release_days INTEGER DEFAULT 14,
  platform_fee_percentage DECIMAL(5, 2) DEFAULT 10.00,
  min_withdrawal_amount DECIMAL(10, 2) DEFAULT 50.00,
  refund_window_days INTEGER DEFAULT 30,
  dispute_resolution_days INTEGER DEFAULT 14,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  opened_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_files TEXT[],
  status TEXT CHECK (status IN ('open', 'under_review', 'resolved', 'closed')) DEFAULT 'open',
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')) NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  push_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  order_updates BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT true,
  show_online_status BOOLEAN DEFAULT true,
  show_last_seen BOOLEAN DEFAULT true,
  profile_visibility BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  allow_messages BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('card', 'bank')) NOT NULL,
  last4 TEXT NOT NULL,
  brand TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  stripe_payment_method_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_user_id ON seller_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_verifications_status ON seller_verifications(status);
CREATE INDEX IF NOT EXISTS idx_gigs_seller ON gigs(seller_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category_id);
CREATE INDEX IF NOT EXISTS idx_gigs_is_active ON gigs(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_seller_wallets_seller ON seller_wallets(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION create_seller_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD IS NULL OR OLD.status != 'approved') THEN
    UPDATE profiles 
    SET user_type = 'seller' 
    WHERE id = NEW.user_id AND user_type != 'seller';
    
    INSERT INTO seller_wallets (seller_id, available_balance, pending_balance, total_earned)
    VALUES (NEW.user_id, 0, 0, 0)
    ON CONFLICT (seller_id) DO NOTHING;
  END IF;
  
  IF NEW.status = 'rejected' AND (OLD IS NULL OR OLD.status != 'rejected') THEN
    UPDATE profiles 
    SET user_type = 'buyer' 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in create_seller_wallet: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_seller_verified
  AFTER UPDATE ON seller_verifications
  FOR EACH ROW 
  EXECUTE FUNCTION create_seller_wallet();

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
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "seller_verifications_select_own" ON seller_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "seller_verifications_insert_own" ON seller_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "seller_verifications_update_own" ON seller_verifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);

CREATE POLICY "gigs_select_all" ON gigs FOR SELECT USING (true);
CREATE POLICY "gigs_insert_own" ON gigs FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "gigs_update_own" ON gigs FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "gigs_delete_own" ON gigs FOR DELETE USING (auth.uid() = seller_id);

CREATE POLICY "orders_select_involved" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "orders_insert_buyer" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_involved" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "order_revisions_select_involved" ON order_revisions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_revisions.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));
CREATE POLICY "order_revisions_insert_involved" ON order_revisions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_revisions.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));
CREATE POLICY "order_revisions_update_involved" ON order_revisions FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_revisions.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));

CREATE POLICY "messages_select_involved" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_update_receiver" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "seller_wallets_select_own" ON seller_wallets FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "seller_wallets_insert_own" ON seller_wallets FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "seller_wallets_update_own" ON seller_wallets FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "withdrawal_requests_select_own" ON withdrawal_requests FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "withdrawal_requests_insert_own" ON withdrawal_requests FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "transactions_select_involved" ON transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "escrow_settings_select_all" ON escrow_settings FOR SELECT USING (true);

CREATE POLICY "reviews_select_all" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_reviewer" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "disputes_select_involved" ON disputes FOR SELECT 
  USING (auth.uid() = opened_by OR EXISTS (SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));
CREATE POLICY "disputes_insert_involved" ON disputes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));
CREATE POLICY "disputes_update_involved" ON disputes FOR UPDATE 
  USING (auth.uid() = opened_by OR EXISTS (SELECT 1 FROM orders WHERE orders.id = disputes.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())));

CREATE POLICY "admin_roles_select_all" ON admin_roles FOR SELECT USING (true);

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_select_own" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_preferences_insert_own" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_preferences_update_own" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_select_own" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_insert_own" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_methods_update_own" ON payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "payment_methods_delete_own" ON payment_methods FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- INSERT DEFAULT DATA
-- =============================================================================

INSERT INTO escrow_settings (
  id,
  clearance_period_days,
  auto_release_days,
  platform_fee_percentage,
  min_withdrawal_amount,
  refund_window_days,
  dispute_resolution_days
)
SELECT 
  uuid_generate_v4(),
  7,
  14,
  10.00,
  50.00,
  30,
  14
WHERE NOT EXISTS (SELECT 1 FROM escrow_settings LIMIT 1);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
  expected_tables TEXT[] := ARRAY[
    'profiles', 'seller_verifications', 'categories', 'gigs', 'orders',
    'order_revisions', 'messages', 'seller_wallets', 'withdrawal_requests',
    'transactions', 'financial_logs', 'escrow_settings', 'reviews',
    'disputes', 'admin_roles', 'notifications', 'user_preferences', 'payment_methods'
  ];
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = ANY(expected_tables);
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'SCHEMA SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Tables created: %/%', table_count, array_length(expected_tables, 1);
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Seed categories if needed';
  RAISE NOTICE '  2. Create admin users';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
END $$;
