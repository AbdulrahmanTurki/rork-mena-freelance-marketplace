import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMessages, useSendMessage, useConversations, useMarkMessageAsRead } from '@/hooks/useMessages';
import { useSellerWallet, useWithdrawalRequests, useCreateWithdrawalRequest } from '@/hooks/useWallet';
import { useProfile, useProfiles, useUpdateProfile } from '@/hooks/useProfiles';
import { useCategories, useCategory, useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { useUserPreferences, useUpdateUserPreferences } from '@/hooks/useUserPreferences';
import { usePaymentMethods, useAddPaymentMethod, useDeletePaymentMethod } from '@/hooks/usePaymentMethods';
import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

jest.mock('@/lib/supabase');
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com', type: 'buyer' },
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

describe('useMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch messages for an order', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        order_id: 'order-1',
        sender_id: 'user-1',
        receiver_id: 'user-2',
        message: 'Hello',
        created_at: '2024-01-01',
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMessages('order-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMessages);
  });
});

describe('useSendMessage', () => {
  it('should send a message', async () => {
    const mockMessage = {
      id: 'msg-1',
      message: 'Test message',
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockMessage, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSendMessage(), { wrapper });

    await waitFor(() => {
      result.current.mutate({
        order_id: 'order-1',
        sender_id: 'user-1',
        receiver_id: 'user-2',
        message: 'Test message',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useConversations', () => {
  it('should fetch and group conversations', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        sender_id: 'user-1',
        receiver_id: 'user-123',
        message: 'Hello',
        sender: { id: 'user-1', full_name: 'User 1' },
        receiver: { id: 'user-123', full_name: 'Me' },
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockMessages, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useConversations(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useSellerWallet', () => {
  it('should fetch seller wallet', async () => {
    const mockWallet = {
      id: 'wallet-1',
      seller_id: 'user-123',
      available_balance: 1000,
      total_earned: 5000,
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockWallet, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSellerWallet('user-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWallet);
  });

  it('should return null when no wallet found', async () => {
    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSellerWallet('user-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeNull();
  });
});

describe('useWithdrawalRequests', () => {
  it('should fetch withdrawal requests', async () => {
    const mockRequests = [
      {
        id: 'req-1',
        seller_id: 'user-123',
        amount: 500,
        status: 'pending',
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockRequests, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useWithdrawalRequests('user-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockRequests);
  });
});

describe('useProfile', () => {
  it('should fetch user profile', async () => {
    const mockProfile = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      user_type: 'buyer',
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProfile('user-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject(mockProfile);
  });
});

describe('useProfiles', () => {
  it('should fetch profiles with filters', async () => {
    const mockProfiles = [
      {
        id: 'user-1',
        full_name: 'Seller 1',
        user_type: 'seller',
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useProfiles({ userType: 'seller' }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProfiles);
  });
});

describe('useUpdateProfile', () => {
  it('should update user profile', async () => {
    const mockProfile = {
      id: 'user-1',
      full_name: 'Updated Name',
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await waitFor(() => {
      result.current.mutate({
        userId: 'user-1',
        updates: { full_name: 'Updated Name' },
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useCategories', () => {
  it('should fetch all categories', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Design', icon: 'palette' },
      { id: 'cat-2', name: 'Development', icon: 'code' },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockCategories, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCategories);
  });
});

describe('useCategory', () => {
  it('should fetch single category', async () => {
    const mockCategory = { id: 'cat-1', name: 'Design', icon: 'palette' };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockCategory, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCategory('cat-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCategory);
  });
});

describe('useCreateCategory', () => {
  it('should create new category', async () => {
    const mockCategory = { id: 'cat-3', name: 'Writing', icon: 'pen' };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockCategory, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateCategory(), { wrapper });

    await waitFor(() => {
      result.current.mutate({ name: 'Writing', icon: 'pen' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useUserPreferences', () => {
  it('should fetch user preferences', async () => {
    const mockPrefs = {
      user_id: 'user-1',
      push_notifications: true,
      email_notifications: true,
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockPrefs, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserPreferences('user-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockPrefs);
  });

  it('should create default preferences if not found', async () => {
    const mockPrefs = {
      user_id: 'user-1',
      push_notifications: true,
      email_notifications: true,
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      }),
    }).mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockPrefs, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserPreferences('user-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('usePaymentMethods', () => {
  it('should fetch payment methods', async () => {
    const mockMethods = [
      {
        id: 'pm-1',
        user_id: 'user-1',
        type: 'card',
        is_default: true,
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      mockResolvedValue: jest.fn().mockResolvedValue({ data: mockMethods, error: null }),
    });

    fromMock().order = jest.fn().mockResolvedValue({ data: mockMethods, error: null });

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePaymentMethods('user-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMethods);
  });
});

describe('useAddPaymentMethod', () => {
  it('should add new payment method', async () => {
    const mockMethod = {
      id: 'pm-2',
      user_id: 'user-1',
      type: 'bank',
      is_default: false,
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockMethod, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAddPaymentMethod(), { wrapper });

    await waitFor(() => {
      result.current.mutate({
        user_id: 'user-1',
        type: 'bank',
        last_four: '1234',
        is_default: false,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useDeletePaymentMethod', () => {
  it('should delete payment method', async () => {
    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeletePaymentMethod(), { wrapper });

    await waitFor(() => {
      result.current.mutate({ id: 'pm-1', userId: 'user-1' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
