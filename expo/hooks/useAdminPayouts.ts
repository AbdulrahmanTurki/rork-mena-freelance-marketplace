import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminPayout {
  id: string;
  seller_id: string;
  wallet_id: string;
  amount: number;
  payout_method: string;
  payout_details: any;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  processed_at: string | null;
  processed_by: string | null;
  decline_reason: string | null;
  created_at: string;
  seller?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export function useAdminPayouts(status?: string) {
  return useQuery({
    queryKey: ['admin', 'payouts', status],
    queryFn: async () => {
      console.log('[useAdminPayouts] Fetching payouts...');
      let query = supabase
        .from('withdrawal_requests')
        .select(`
          *,
          seller:profiles!withdrawal_requests_seller_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useAdminPayouts] Error:', error);
        throw error;
      }

      console.log('[useAdminPayouts] Fetched payouts:', data?.length);
      return data as AdminPayout[];
    },
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payoutId, processedBy }: { payoutId: string; processedBy: string }) => {
      console.log('[useApprovePayout] Approving payout:', payoutId);
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          processed_at: new Date().toISOString(),
          processed_by: processedBy,
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) {
        console.error('[useApprovePayout] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    },
  });
}

export function useDeclinePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      payoutId, 
      reason, 
      processedBy 
    }: { 
      payoutId: string; 
      reason: string; 
      processedBy: string;
    }) => {
      console.log('[useDeclinePayout] Declining payout:', payoutId);
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'declined',
          decline_reason: reason,
          processed_at: new Date().toISOString(),
          processed_by: processedBy,
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) {
        console.error('[useDeclinePayout] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    },
  });
}

export function useCompletePayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payoutId: string) => {
      console.log('[useCompletePayout] Completing payout:', payoutId);
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'completed' })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) {
        console.error('[useCompletePayout] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payouts'] });
    },
  });
}
