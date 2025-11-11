import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminDispute {
  id: string;
  order_id: string;
  reason: string;
  description: string;
  evidence_files: string[] | null;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  opened_by: string | null;
  resolved_by: string | null;
  opener?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  order?: {
    id: string;
    order_number: string;
    gig_title: string;
    buyer_id: string | null;
    seller_id: string | null;
  };
}

export function useAdminDisputes(status?: string) {
  return useQuery({
    queryKey: ['admin', 'disputes', status],
    queryFn: async () => {
      console.log('[useAdminDisputes] Fetching disputes...');
      let query = supabase
        .from('disputes')
        .select(`
          *,
          opener:profiles!disputes_opened_by_fkey(id, full_name, email),
          order:orders(id, order_number, gig_title, buyer_id, seller_id)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useAdminDisputes] Error:', error);
        throw error;
      }

      console.log('[useAdminDisputes] Fetched disputes:', data?.length);
      return data as AdminDispute[];
    },
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      disputeId, 
      resolution, 
      resolvedBy 
    }: { 
      disputeId: string; 
      resolution: string; 
      resolvedBy: string;
    }) => {
      console.log('[useResolveDispute] Resolving dispute:', disputeId);
      const { data, error } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          resolution,
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', disputeId)
        .select()
        .single();

      if (error) {
        console.error('[useResolveDispute] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
    },
  });
}

export function useUpdateDisputeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      disputeId, 
      status 
    }: { 
      disputeId: string; 
      status: 'open' | 'under_review' | 'resolved' | 'closed';
    }) => {
      console.log('[useUpdateDisputeStatus] Updating dispute status:', disputeId, status);
      const { data, error } = await supabase
        .from('disputes')
        .update({ status })
        .eq('id', disputeId)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateDisputeStatus] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
    },
  });
}
