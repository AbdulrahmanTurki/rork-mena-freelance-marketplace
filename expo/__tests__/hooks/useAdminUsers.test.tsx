import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminUsers, useApproveUser, useSuspendUser } from '@/hooks/useAdminUsers';
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

describe('useAdminUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'buyer',
        created_at: '2024-01-01',
      },
    ];

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
  });

  it('should handle fetch error', async () => {
    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAdminUsers(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe('useApproveUser', () => {
  it('should approve user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      mobile_verified: true,
      email_verified: true,
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useApproveUser(), { wrapper });

    await waitFor(() => {
      result.current.mutate('user-1');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });
});

describe('useSuspendUser', () => {
  it('should suspend user with reason', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSuspendUser(), { wrapper });

    await waitFor(() => {
      result.current.mutate({ userId: 'user-1', reason: 'Violation of terms' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
