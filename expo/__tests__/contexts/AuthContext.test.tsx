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

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
  });

  describe('signup', () => {
    it('should successfully signup a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'buyer',
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResult: { error?: string } = {};
      await act(async () => {
        signupResult = await result.current.signup(
          'test@example.com',
          'password123',
          'Test User',
          'buyer'
        );
      });

      expect(signupResult.error).toBeUndefined();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
    });

    it('should handle rate limit error', async () => {
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'email rate limit exceeded',
          status: 429,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let signupResult: { error?: string } = {};
      await act(async () => {
        signupResult = await result.current.signup(
          'test@example.com',
          'password123',
          'Test User',
          'buyer'
        );
      });

      expect(signupResult.error).toContain('Too many signup attempts');
    });

    it('should create seller profile correctly', async () => {
      const mockUser = {
        id: 'seller-123',
        email: 'seller@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockProfile = {
        id: 'seller-123',
        email: 'seller@example.com',
        full_name: 'Seller User',
        user_type: 'buyer',
      };

      const updateMock = jest.fn().mockReturnThis();
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        insert: jest.fn().mockReturnThis(),
        update: updateMock,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signup(
          'seller@example.com',
          'password123',
          'Seller User',
          'seller'
        );
      });

      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'buyer',
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: { error?: string } = {};
      await act(async () => {
        loginResult = await result.current.login(
          'test@example.com',
          'password123'
        );
      });

      expect(loginResult.error).toBeUndefined();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Invalid login credentials',
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      let loginResult: { error?: string } = {};
      await act(async () => {
        loginResult = await result.current.login(
          'test@example.com',
          'wrongpassword'
        );
      });

      expect(loginResult.error).toBe('Invalid login credentials');
    });
  });

  describe('continueAsGuest', () => {
    it('should set guest user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.continueAsGuest();
      });

      await waitFor(() => {
        expect(result.current.user?.type).toBe('guest');
        expect(result.current.isGuest).toBe(true);
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('switchToSeller', () => {
    it('should switch user type to seller', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: {
          session: { user: mockUser },
        },
      });

      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        user_type: 'buyer',
      };

      const updateMock = jest.fn().mockReturnThis();
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        update: updateMock,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.switchToSeller();
      });

      expect(updateMock).toHaveBeenCalled();
    });
  });
});
