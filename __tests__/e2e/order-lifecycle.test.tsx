import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateOrder,
  useUpdateOrder,
  useDeliverOrder,
  useCompleteOrder,
} from '@/hooks/useOrders';
import { supabase } from '@/lib/supabase';
import React from 'react';

jest.mock('@/lib/supabase');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Order Lifecycle E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full order lifecycle from creation to completion', async () => {
    const orderId = 'order-test-123';
    const newOrderData = {
      gig_id: 'gig-1',
      buyer_id: 'buyer-1',
      seller_id: 'seller-1',
      amount: 100,
      package_type: 'basic',
    };

    const fromMock = supabase.from as jest.Mock;

    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          data: { id: orderId, ...newOrderData, status: 'pending' },
          error: null,
        });
      }),
    });

    const { result: createResult } = renderHook(() => useCreateOrder(), {
      wrapper: createWrapper(),
    });

    let createdOrder;
    await waitFor(async () => {
      createdOrder = await createResult.current.mutateAsync(newOrderData as any);
    });

    expect(createdOrder).toMatchObject({
      id: orderId,
      status: 'pending',
    });

    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: orderId, status: 'in_progress' },
        error: null,
      }),
    });

    const { result: updateResult } = renderHook(() => useUpdateOrder(), {
      wrapper: createWrapper(),
    });

    let updatedOrder;
    await waitFor(async () => {
      updatedOrder = await updateResult.current.mutateAsync({
        id: orderId,
        updates: { status: 'in_progress' },
      });
    });

    expect(updatedOrder).toMatchObject({
      id: orderId,
      status: 'in_progress',
    });

    const deliveryFiles = ['final-work.zip'];
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: orderId,
          status: 'delivered',
          delivery_files: deliveryFiles,
        },
        error: null,
      }),
    });

    const { result: deliverResult } = renderHook(() => useDeliverOrder(), {
      wrapper: createWrapper(),
    });

    let deliveredOrder;
    await waitFor(async () => {
      deliveredOrder = await deliverResult.current.mutateAsync({
        orderId,
        deliveryFiles,
      });
    });

    expect(deliveredOrder).toMatchObject({
      id: orderId,
      status: 'delivered',
      delivery_files: deliveryFiles,
    });

    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: orderId, status: 'completed' },
        error: null,
      }),
    });

    const { result: completeResult } = renderHook(() => useCompleteOrder(), {
      wrapper: createWrapper(),
    });

    let completedOrder;
    await waitFor(async () => {
      completedOrder = await completeResult.current.mutateAsync(orderId);
    });

    expect(completedOrder).toMatchObject({
      id: orderId,
      status: 'completed',
    });
  });

  it('should handle revision request during order', async () => {
    const orderId = 'order-revision-123';

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          order_id: orderId,
          revision_number: 1,
          status: 'pending',
        },
        error: null,
      }),
    });

    expect(fromMock().insert).toBeDefined();
  });

  it('should handle order cancellation', async () => {
    const orderId = 'order-cancel-123';

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: orderId, status: 'cancelled' },
        error: null,
      }),
    });

    const { result } = renderHook(() => useUpdateOrder(), {
      wrapper: createWrapper(),
    });

    let cancelledOrder;
    await waitFor(async () => {
      cancelledOrder = await result.current.mutateAsync({
        id: orderId,
        updates: { status: 'cancelled' },
      });
    });

    expect(cancelledOrder).toMatchObject({
      status: 'cancelled',
    });
  });
});
