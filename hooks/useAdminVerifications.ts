import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminVerification {
  id: string;
  user_id: string;
  id_front_url: string | null;
  id_back_url: string | null;
  permit_number: string | null;
  permit_expiration_date: string | null;
  permit_document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export function useAdminVerifications(status?: string) {
  return useQuery({
    queryKey: ['admin', 'verifications', status],
    queryFn: async () => {
      console.log('[useAdminVerifications] Fetching verifications...');
      let query = supabase
        .from('seller_verifications')
        .select(`
          *,
          user:profiles!seller_verifications_user_id_fkey(id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useAdminVerifications] Error:', JSON.stringify(error, null, 2));
        console.error('[useAdminVerifications] Error message:', error.message);
        throw new Error(error.message || 'Failed to fetch verifications');
      }

      console.log('[useAdminVerifications] Fetched verifications:', data?.length);
      console.log('[useAdminVerifications] Sample verification data:', JSON.stringify(data?.[0], null, 2));
      if (data && data.length > 0 && data[0]) {
        console.log('[useAdminVerifications] Attachment URLs:');
        console.log('  - id_front_url:', data[0].id_front_url);
        console.log('  - id_back_url:', data[0].id_back_url);
        console.log('  - permit_document_url:', data[0].permit_document_url);
      }
      return data as AdminVerification[];
    },
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verificationId, reviewedBy }: { verificationId: string; reviewedBy: string }) => {
      console.log('[useApproveVerification] Approving verification:', verificationId);
      
      const { data: verification, error: verificationError } = await supabase
        .from('seller_verifications')
        .update({
          status: 'approved',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', verificationId)
        .select()
        .single();

      if (verificationError) {
        console.error('[useApproveVerification] Error:', JSON.stringify(verificationError, null, 2));
        console.error('[useApproveVerification] Error message:', verificationError.message);
        throw new Error(verificationError.message || 'Failed to approve verification');
      }

      console.log('[useApproveVerification] Verification approved, updating user profile to seller');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          user_type: 'seller',
        })
        .eq('id', verification.user_id);

      if (profileError) {
        console.error('[useApproveVerification] Profile update error:', JSON.stringify(profileError, null, 2));
        throw new Error(profileError.message || 'Failed to update user profile');
      }

      console.log('[useApproveVerification] User profile updated to seller successfully');
      return verification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      verificationId, 
      reason, 
      reviewedBy 
    }: { 
      verificationId: string; 
      reason: string; 
      reviewedBy: string;
    }) => {
      console.log('[useRejectVerification] Rejecting verification:', verificationId);
      const { data, error } = await supabase
        .from('seller_verifications')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', verificationId)
        .select()
        .single();

      if (error) {
        console.error('[useRejectVerification] Error:', JSON.stringify(error, null, 2));
        console.error('[useRejectVerification] Error message:', error.message);
        throw new Error(error.message || 'Failed to reject verification');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verifications'] });
    },
  });
}
