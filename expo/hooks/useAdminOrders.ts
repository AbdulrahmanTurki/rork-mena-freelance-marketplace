import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminOrder {
  id: string;
  order_number: string;
  gig_title: string;
  gig_price: number;
  status: 'pending_payment' | 'in_progress' | 'delivered' | 'revision_requested' | 'completed' | 'cancelled' | 'disputed' | 'refunded';
  delivery_files: string[] | null;
  delivered_at: string | null;
  escrow_amount: number;
  platform_fee: number;
  seller_net_amount: number;
  is_frozen: boolean;
  frozen_reason: string | null;
  created_at: string;
  buyer_id: string | null;
  seller_id: string | null;
  buyer?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  seller?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      console.log('[useAdminOrders] Fetching orders...');
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(id, full_name, email),
          seller:profiles!orders_seller_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useAdminOrders] Error:', error);
        throw error;
      }

      console.log('[useAdminOrders] Fetched orders:', data?.length);
      return data as AdminOrder[];
    },
  });
}

export function useFreezeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason, frozenUntil }: { orderId: string; reason: string; frozenUntil?: string }) => {
      console.log('[useFreezeOrder] Freezing order:', orderId);
      const { data, error } = await supabase
        .from('orders')
        .update({
          is_frozen: true,
          frozen_reason: reason,
          frozen_until: frozenUntil || null,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('[useFreezeOrder] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useUnfreezeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log('[useUnfreezeOrder] Unfreezing order:', orderId);
      const { data, error } = await supabase
        .from('orders')
        .update({
          is_frozen: false,
          frozen_reason: null,
          frozen_until: null,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('[useUnfreezeOrder] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}
