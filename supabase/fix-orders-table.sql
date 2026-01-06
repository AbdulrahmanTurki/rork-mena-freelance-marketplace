-- Fix Orders Table Schema
-- This script adds missing columns to the orders table

DO $$ 
BEGIN
  -- Add gig_title column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'gig_title'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN gig_title TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Added gig_title column';
  END IF;

  -- Add gig_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'gig_price'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN gig_price NUMERIC NOT NULL DEFAULT 0;
    RAISE NOTICE 'Added gig_price column';
  END IF;

  -- Add delivery_files column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'delivery_files'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_files TEXT[] DEFAULT NULL;
    RAISE NOTICE 'Added delivery_files column';
  END IF;

  -- Add delivered_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'delivered_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivered_at TIMESTAMPTZ DEFAULT NULL;
    RAISE NOTICE 'Added delivered_at column';
  END IF;

  -- Add completed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NULL;
    RAISE NOTICE 'Added completed_at column';
  END IF;

  -- Add revisions_allowed column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'revisions_allowed'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN revisions_allowed INTEGER DEFAULT 0;
    RAISE NOTICE 'Added revisions_allowed column';
  END IF;

  -- Add revisions_used column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'revisions_used'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN revisions_used INTEGER DEFAULT 0;
    RAISE NOTICE 'Added revisions_used column';
  END IF;

  -- Add escrow_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'escrow_amount'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN escrow_amount NUMERIC DEFAULT 0;
    RAISE NOTICE 'Added escrow_amount column';
  END IF;

  -- Add platform_fee column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'platform_fee'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN platform_fee NUMERIC DEFAULT 0;
    RAISE NOTICE 'Added platform_fee column';
  END IF;

  -- Add seller_net_amount column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'seller_net_amount'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN seller_net_amount NUMERIC DEFAULT 0;
    RAISE NOTICE 'Added seller_net_amount column';
  END IF;

  -- Add auto_release_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'auto_release_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN auto_release_at TIMESTAMPTZ DEFAULT NULL;
    RAISE NOTICE 'Added auto_release_at column';
  END IF;

  -- Add is_frozen column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'is_frozen'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN is_frozen BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_frozen column';
  END IF;

  -- Add frozen_until column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'frozen_until'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN frozen_until TIMESTAMPTZ DEFAULT NULL;
    RAISE NOTICE 'Added frozen_until column';
  END IF;

  -- Add frozen_reason column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'frozen_reason'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN frozen_reason TEXT DEFAULT NULL;
    RAISE NOTICE 'Added frozen_reason column';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'orders' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column';
  END IF;

  -- Update status constraint to include all statuses
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending_payment', 'in_progress', 'delivered', 'revision_requested', 'completed', 'cancelled', 'disputed', 'refunded'));
  RAISE NOTICE 'Updated status constraint';

  RAISE NOTICE 'Orders table schema fixed successfully!';
END $$;

-- Create or replace trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure order_revisions table exists
CREATE TABLE IF NOT EXISTS public.order_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  revision_number INTEGER NOT NULL,
  request_message TEXT NOT NULL,
  response_message TEXT,
  response_files TEXT[],
  responded_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
    )
  );

-- Add RLS policies for order_revisions
ALTER TABLE public.order_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view revisions for their orders" ON public.order_revisions;
CREATE POLICY "Users can view revisions for their orders" ON public.order_revisions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_revisions.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.admin_roles
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create revisions for their orders" ON public.order_revisions;
CREATE POLICY "Users can create revisions for their orders" ON public.order_revisions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_revisions.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update revisions for their orders" ON public.order_revisions;
CREATE POLICY "Users can update revisions for their orders" ON public.order_revisions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_revisions.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Orders table schema has been fixed!';
  RAISE NOTICE '✅ RLS policies have been configured!';
  RAISE NOTICE '✅ You can now fetch orders without errors!';
END $$;
