import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import React from 'react';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
  checkSignupRateLimit: jest.fn(() => Promise.resolve({ allowed: true })),
  recordSignupAttempt: jest.fn(() => Promise.resolve()),
  clearSignupAttempts: jest.fn(() => Promise.resolve()),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
  });

  it('should complete full signup and login flow', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'newuser@example.com',
    };

    const mockProfile = {
      id: 'user-123',
      email: 'newuser@example.com',
      full_name: 'New User',
      user_type: 'buyer',
    };

    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup(
        'newuser@example.com',
        'password123',
        'New User',
        'buyer'
      );
    });

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.email).toBe('newuser@example.com');
    });

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    await act(async () => {
      await result.current.login('newuser@example.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle buyer to seller conversion', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
    };

    const buyerProfile = {
      id: 'user-123',
      email: 'user@example.com',
      full_name: 'Test User',
      user_type: 'buyer',
    };

    const sellerProfile = {
      ...buyerProfile,
      user_type: 'seller',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    const fromMock = supabase.from as jest.Mock;
    let callCount = 0;
    fromMock.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: buyerProfile, error: null });
        }
        return Promise.resolve({ data: sellerProfile, error: null });
      }),
      update: jest.fn().mockReturnThis(),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.type).toBe('buyer');
    });

    await act(async () => {
      await result.current.switchToSeller();
    });

    await waitFor(() => {
      expect(result.current.user?.type).toBe('seller');
      expect(result.current.isSeller).toBe(true);
    });
  });

  it('should handle guest mode correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.continueAsGuest();
    });

    await waitFor(() => {
      expect(result.current.isGuest).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
