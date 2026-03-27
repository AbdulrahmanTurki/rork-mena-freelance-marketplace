-- =============================================================================
-- COMPLETE DATABASE SCHEMA
-- Run this first to create all tables and structure
-- This script is IDEMPOTENT - safe to run multiple times
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

-- User profiles table (extends Supabase auth.users)
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

-- Seller verification table
CREATE TABLE IF NOT EXISTS seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Identity documents
  id_front_url TEXT,
  id_back_url TEXT,
  
  -- Saudi Freelance Permit
  permit_number TEXT,
  permit_expiration_date DATE,
  permit_document_url TEXT,
  
  -- Verification status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gigs table
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

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  
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
  
  escrow_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL,
  seller_net_amount DECIMAL(10, 2) NOT NULL,
  
  auto_release_at TIMESTAMPTZ,
  
  is_frozen BOOLEAN DEFAULT false,
  frozen_until TIMESTAMPTZ,
  frozen_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Order revisions table
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

-- Messages/Chat table
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

-- Seller wallets table
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

-- Withdrawal requests table
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

-- Transactions table (financial log)
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

-- Financial logs (admin actions)
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

-- Escrow settings table
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

-- Reviews table
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

-- Disputes table
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

-- Admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')) NOT NULL,
  permissions JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
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

-- User preferences table
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

-- Payment methods table
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
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);

-- =============================================================================
-- INSERT DEFAULT DATA
-- =============================================================================

-- Insert default escrow settings if not exists
DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM escrow_settings LIMIT 1) THEN
    INSERT INTO escrow_settings (
      id,
      clearance_period_days,
      auto_release_days,
      platform_fee_percentage,
      min_withdrawal_amount,
      refund_window_days,
      dispute_resolution_days
    ) VALUES (
      uuid_generate_v4(),
      7,
      14,
      10.00,
      50.00,
      30,
      14
    );
    RAISE NOTICE '✓ Default escrow settings created';
  ELSE
    RAISE NOTICE '→ Escrow settings already exist, skipping';
  END IF;
END $;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $
DECLARE
  table_count INTEGER;
  expected_tables TEXT[] := ARRAY[
    'profiles', 'seller_verifications', 'categories', 'gigs', 'orders',
    'order_revisions', 'messages', 'seller_wallets', 'withdrawal_requests',
    'transactions', 'financial_logs', 'escrow_settings', 'reviews',
    'disputes', 'admin_roles', 'notifications', 'user_preferences', 'payment_methods'
  ];
  missing_tables TEXT[];
  tbl TEXT;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✓ SCHEMA SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  
  -- Count existing tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = ANY(expected_tables);
  
  RAISE NOTICE 'Tables found: % / %', table_count, array_length(expected_tables, 1);
  
  -- Check for missing tables
  missing_tables := ARRAY[]::TEXT[];
  FOREACH tbl IN ARRAY expected_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      missing_tables := array_append(missing_tables, tbl);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Missing tables: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✓ All expected tables exist';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run 02-rls-policies.sql';
  RAISE NOTICE '====================================================';
END $;
