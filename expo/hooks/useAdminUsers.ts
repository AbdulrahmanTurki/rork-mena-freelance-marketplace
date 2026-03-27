import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  full_name_arabic: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  gender: string | null;
  mobile_number: string | null;
  city: string | null;
  user_type: 'buyer' | 'seller';
  mobile_verified: boolean;
  email_verified: boolean;
  created_at: string;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      console.log('[useAdminUsers] Fetching users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useAdminUsers] Error:', error);
        throw error;
      }

      console.log('[useAdminUsers] Fetched users:', data?.length);
      console.log('[useAdminUsers] Sample user data:', JSON.stringify(data?.[0], null, 2));
      return data as AdminUser[];
    },
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('[useApproveUser] Approving user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .update({ mobile_verified: true, email_verified: true })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[useApproveUser] Error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      console.log('[useSuspendUser] Suspending user:', userId, reason);
      return { userId, reason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
