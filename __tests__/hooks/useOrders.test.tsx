import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useOrders,
  useOrder,
  useCreateOrder,
  useUpdateOrder,
  useDeliverOrder,
  useCompleteOrder,
} from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

jest.mock('@/lib/supabase');
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com', type: 'buyer' },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('useOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOrders', () => {
    it('should fetch all orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'active',
          buyer_id: 'user-123',
          seller_id: 'seller-1',
        },
        {
          id: 'order-2',
          status: 'completed',
          buyer_id: 'user-123',
          seller_id: 'seller-2',
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOrders);
    });

    it('should fetch orders by buyer', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          buyer_id: 'buyer-123',
        },
      ];

      const eqMock = jest.fn().mockReturnThis();
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: eqMock,
        order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      const { result } = renderHook(
        () => useOrders({ buyerId: 'buyer-123' }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(eqMock).toHaveBeenCalledWith('buyer_id', 'buyer-123');
    });

    it('should fetch orders by status', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          status: 'active',
        },
      ];

      const eqMock = jest.fn().mockReturnThis();
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        eq: eqMock,
        order: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
      });

      const { result } = renderHook(() => useOrders({ status: 'active' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(eqMock).toHaveBeenCalledWith('status', 'active');
    });
  });

  describe('useOrder', () => {
    it('should fetch single order with details', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'active',
        gig: {
          id: 'gig-1',
          title: 'Test Gig',
        },
        buyer: {
          id: 'buyer-1',
          full_name: 'Test Buyer',
        },
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockOrder, error: null }),
      });

      const { result } = renderHook(() => useOrder('order-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockOrder);
    });

    it('should handle order not found', async () => {
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const { result } = renderHook(() => useOrder('order-999'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useCreateOrder', () => {
    it('should create a new order', async () => {
      const newOrder = {
        gig_id: 'gig-1',
        buyer_id: 'buyer-1',
        seller_id: 'seller-1',
        amount: 100,
      };

      const mockCreatedOrder = {
        id: 'order-new',
        ...newOrder,
        status: 'pending',
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockCreatedOrder, error: null }),
      });

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      let createdOrder;
      await waitFor(async () => {
        createdOrder = await result.current.mutateAsync(newOrder as any);
      });

      expect(createdOrder).toEqual(mockCreatedOrder);
    });
  });

  describe('useUpdateOrder', () => {
    it('should update order status', async () => {
      const updates = {
        status: 'in_progress' as const,
      };

      const mockUpdatedOrder = {
        id: 'order-1',
        ...updates,
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockUpdatedOrder, error: null }),
      });

      const { result } = renderHook(() => useUpdateOrder(), {
        wrapper: createWrapper(),
      });

      let updatedOrder;
      await waitFor(async () => {
        updatedOrder = await result.current.mutateAsync({
          id: 'order-1',
          updates,
        });
      });

      expect(updatedOrder).toEqual(mockUpdatedOrder);
    });
  });

  describe('useDeliverOrder', () => {
    it('should deliver order with files', async () => {
      const deliveryFiles = ['file1.zip', 'file2.pdf'];

      const mockDeliveredOrder = {
        id: 'order-1',
        status: 'delivered',
        delivery_files: deliveryFiles,
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockDeliveredOrder, error: null }),
      });

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      let deliveredOrder;
      await waitFor(async () => {
        deliveredOrder = await result.current.mutateAsync({
          orderId: 'order-1',
          deliveryFiles,
        });
      });

      expect(deliveredOrder).toMatchObject({
        status: 'delivered',
        delivery_files: deliveryFiles,
      });
    });
  });

  describe('useCompleteOrder', () => {
    it('should complete order', async () => {
      const mockCompletedOrder = {
        id: 'order-1',
        status: 'completed',
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockCompletedOrder, error: null }),
      });

      const { result } = renderHook(() => useCompleteOrder(), {
        wrapper: createWrapper(),
      });

      let completedOrder;
      await waitFor(async () => {
        completedOrder = await result.current.mutateAsync('order-1');
      });

      expect(completedOrder).toMatchObject({
        status: 'completed',
      });
    });
  });
});
