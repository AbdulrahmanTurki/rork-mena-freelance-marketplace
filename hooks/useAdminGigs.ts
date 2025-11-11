import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminGig {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_time: number;
  images: string[] | null;
  tags: string[] | null;
  rating: number;
  reviews_count: number;
  orders_count: number;
  is_active: boolean;
  created_at: string;
  seller_id: string;
  category_id: string | null;
  seller?: {
    id: string;
    full_name: string | null;
    email: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export function useAdminGigs(status?: 'active' | 'inactive') {
  return useQuery({
    queryKey: ['admin', 'gigs', status],
    queryFn: async () => {
      console.log('[useAdminGigs] Fetching gigs...');
      let query = supabase
        .from('gigs')
        .select(`
          *,
          seller:profiles!gigs_seller_id_fkey(id, full_name, email),
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (status === 'active') {
        query = query.eq('is_active', true);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useAdminGigs] Error:', error);
        throw error;
      }

      console.log('[useAdminGigs] Fetched gigs:', data?.length);
      return data as AdminGig[];
    },
  });
}

export function useApproveGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gigId: string) => {
      console.log('[useApproveGig] Approving gig:', gigId);
      const { data, error } = await supabase
        .from('gigs')
        .update({ is_active: true })
        .eq('id', gigId)
        .select()
        .single();

      if (error) {
        console.error('[useApproveGig] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] });
    },
  });
}

export function usePauseGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gigId: string) => {
      console.log('[usePauseGig] Pausing gig:', gigId);
      const { data, error } = await supabase
        .from('gigs')
        .update({ is_active: false })
        .eq('id', gigId)
        .select()
        .single();

      if (error) {
        console.error('[usePauseGig] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] });
    },
  });
}

export function useRejectGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gigId, reason }: { gigId: string; reason: string }) => {
      console.log('[useRejectGig] Rejecting gig:', gigId, reason);
      const { data, error } = await supabase
        .from('gigs')
        .update({ is_active: false })
        .eq('id', gigId)
        .select()
        .single();

      if (error) {
        console.error('[useRejectGig] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] });
    },
  });
}
