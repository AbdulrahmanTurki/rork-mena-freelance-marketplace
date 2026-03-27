import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminGigs, useApproveGig, usePauseGig } from '@/hooks/useAdminGigs';
import { useAdminOrders, useFreezeOrder, useUnfreezeOrder } from '@/hooks/useAdminOrders';
import { useAdminDisputes, useResolveDispute } from '@/hooks/useAdminDisputes';
import { useAdminPayouts, useApprovePayout, useDeclinePayout } from '@/hooks/useAdminPayouts';
import { useAdminVerifications, useApproveVerification, useRejectVerification } from '@/hooks/useAdminVerifications';
import { supabase } from '@/lib/supabase';
import React from 'react';

jest.mock('@/lib/supabase');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Admin Gigs Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAdminGigs', () => {
    it('should fetch gigs successfully', async () => {
      const mockGigs = [
        {
          id: 'gig-1',
          title: 'Test Gig',
          price: 100,
          is_active: true,
          seller: { id: 's1', full_name: 'Seller' },
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockGigs, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAdminGigs('active'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGigs);
    });
  });

  describe('useApproveGig', () => {
    it('should approve gig successfully', async () => {
      const mockGig = { id: 'gig-1', is_active: true };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockGig, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useApproveGig(), { wrapper });

      await waitFor(() => {
        result.current.mutate('gig-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});

describe('Admin Orders Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAdminOrders', () => {
    it('should fetch orders successfully', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'ORD-001',
          status: 'in_progress',
          buyer: { id: 'b1', full_name: 'Buyer' },
          seller: { id: 's1', full_name: 'Seller' },
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAdminOrders('in_progress'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOrders);
    });
  });

  describe('useFreezeOrder', () => {
    it('should freeze order with reason', async () => {
      const mockOrder = { id: 'order-1', is_frozen: true };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useFreezeOrder(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          orderId: 'order-1',
          reason: 'Under investigation',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});

describe('Admin Disputes Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAdminDisputes', () => {
    it('should fetch disputes successfully', async () => {
      const mockDisputes = [
        {
          id: 'dispute-1',
          order_id: 'order-1',
          reason: 'Not delivered',
          status: 'open',
          opener: { id: 'u1', full_name: 'User' },
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockDisputes, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAdminDisputes('open'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDisputes);
    });
  });

  describe('useResolveDispute', () => {
    it('should resolve dispute successfully', async () => {
      const mockDispute = { id: 'dispute-1', status: 'resolved' };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDispute, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useResolveDispute(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          disputeId: 'dispute-1',
          resolution: 'Refund issued',
          resolvedBy: 'admin-1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});

describe('Admin Payouts Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAdminPayouts', () => {
    it('should fetch payouts successfully', async () => {
      const mockPayouts = [
        {
          id: 'payout-1',
          seller_id: 's1',
          amount: 500,
          status: 'pending',
          seller: { id: 's1', full_name: 'Seller' },
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockPayouts, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAdminPayouts('pending'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPayouts);
    });
  });

  describe('useApprovePayout', () => {
    it('should approve payout successfully', async () => {
      const mockPayout = { id: 'payout-1', status: 'approved' };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPayout, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useApprovePayout(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          payoutId: 'payout-1',
          processedBy: 'admin-1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useDeclinePayout', () => {
    it('should decline payout with reason', async () => {
      const mockPayout = { id: 'payout-1', status: 'declined' };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPayout, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeclinePayout(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          payoutId: 'payout-1',
          reason: 'Insufficient balance',
          processedBy: 'admin-1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});

describe('Admin Verifications Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAdminVerifications', () => {
    it('should fetch verifications successfully', async () => {
      const mockVerifications = [
        {
          id: 'ver-1',
          user_id: 'user-1',
          status: 'pending',
          user: { id: 'user-1', full_name: 'Test User', email: 'test@example.com' },
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockVerifications, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAdminVerifications('pending'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockVerifications);
    });
  });

  describe('useApproveVerification', () => {
    it('should approve verification and update user to seller', async () => {
      const mockVerification = { id: 'ver-1', user_id: 'user-1', status: 'approved' };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockImplementation((table: string) => {
        if (table === 'seller_verifications') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockVerification, error: null }),
          };
        }
        if (table === 'profiles') {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useApproveVerification(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          verificationId: 'ver-1',
          reviewedBy: 'admin-1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useRejectVerification', () => {
    it('should reject verification with reason', async () => {
      const mockVerification = { id: 'ver-1', status: 'rejected' };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockVerification, error: null }),
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRejectVerification(), { wrapper });

      await waitFor(() => {
        result.current.mutate({
          verificationId: 'ver-1',
          reason: 'Invalid documents',
          reviewedBy: 'admin-1',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
