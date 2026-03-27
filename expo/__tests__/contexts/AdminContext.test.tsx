import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

jest.mock('@/lib/supabase');
jest.mock('@react-native-async-storage/async-storage');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AdminProvider>{children}</AdminProvider>
);

describe('AdminContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('loginAdmin', () => {
    it('should successfully login admin user', async () => {
      const mockUser = {
        id: 'admin-123',
        email: 'admin@platform.com',
      };

      const mockAdminRole = {
        user_id: 'admin-123',
        role: 'super_admin',
        permissions: { all: true },
      };

      const mockProfile = {
        id: 'admin-123',
        full_name: 'Admin User',
        email: 'admin@platform.com',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockImplementation((table: string) => {
        if (table === 'admin_roles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockAdminRole, error: null }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      let loginResult = false;
      await act(async () => {
        loginResult = await result.current.loginAdmin(
          'admin@platform.com',
          'password123'
        );
      });

      expect(loginResult).toBe(true);
      expect(result.current.adminUser).toMatchObject({
        id: 'admin-123',
        email: 'admin@platform.com',
        role: 'super_admin',
      });
    });

    it('should reject non-admin users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      let loginResult = false;
      await act(async () => {
        loginResult = await result.current.loginAdmin(
          'user@example.com',
          'password123'
        );
      });

      expect(loginResult).toBe(false);
      expect(result.current.adminUser).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      let loginResult = false;
      await act(async () => {
        loginResult = await result.current.loginAdmin(
          'admin@platform.com',
          'wrongpassword'
        );
      });

      expect(loginResult).toBe(false);
    });
  });

  describe('logoutAdmin', () => {
    it('should successfully logout admin', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await act(async () => {
        await result.current.logoutAdmin();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('adminData');
      expect(result.current.adminUser).toBeNull();
    });
  });

  describe('hasPermission', () => {
    it('should return true for super admin with all permissions', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin User',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.adminUser).not.toBeNull();
      });

      expect(result.current.hasPermission('users')).toBe(true);
      expect(result.current.hasPermission('gigs')).toBe(true);
      expect(result.current.hasPermission('disputes')).toBe(true);
    });

    it('should return false for missing permission', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Support Agent',
            email: 'support@platform.com',
            role: 'support_agent',
            permissions: ['disputes', 'support'],
          },
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.adminUser).not.toBeNull();
      });

      expect(result.current.hasPermission('disputes')).toBe(true);
      expect(result.current.hasPermission('users')).toBe(false);
    });
  });

  describe('approveUser', () => {
    it('should approve a user', async () => {
      const mockUsers = [
        {
          id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          type: 'buyer' as const,
          status: 'pending' as const,
          verified: false,
          joinedDate: '2024-01-15',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          users: mockUsers,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.users.length).toBe(1);
      });

      await act(async () => {
        await result.current.approveUser('u1');
      });

      expect(result.current.users[0].status).toBe('active');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('rejectUser', () => {
    it('should reject a user with reason', async () => {
      const mockUsers = [
        {
          id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          type: 'buyer' as const,
          status: 'pending' as const,
          verified: false,
          joinedDate: '2024-01-15',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          users: mockUsers,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.users.length).toBe(1);
      });

      await act(async () => {
        await result.current.rejectUser('u1', 'Invalid documents');
      });

      expect(result.current.users[0].status).toBe('banned');
    });
  });

  describe('suspendUser', () => {
    it('should suspend a user', async () => {
      const mockUsers = [
        {
          id: 'u1',
          name: 'John Doe',
          email: 'john@example.com',
          type: 'buyer' as const,
          status: 'active' as const,
          verified: true,
          joinedDate: '2024-01-15',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          users: mockUsers,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.users.length).toBe(1);
      });

      await act(async () => {
        await result.current.suspendUser('u1', 'Suspicious activity');
      });

      expect(result.current.users[0].status).toBe('suspended');
    });
  });

  describe('approveGig', () => {
    it('should approve a gig', async () => {
      const mockGigs = [
        {
          id: 'g1',
          title: 'Test Gig',
          sellerId: 's1',
          sellerName: 'Seller',
          category: 'design',
          price: 100,
          status: 'pending_approval' as const,
          orders: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          gigs: mockGigs,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.gigs.length).toBe(1);
      });

      await act(async () => {
        await result.current.approveGig('g1');
      });

      expect(result.current.gigs[0].status).toBe('active');
    });
  });

  describe('resolveDispute', () => {
    it('should resolve a dispute', async () => {
      const mockDisputes = [
        {
          id: 'd1',
          orderId: 'o1',
          reporterId: 'r1',
          reporterName: 'Reporter',
          reportedId: 'r2',
          reportedName: 'Reported',
          reason: 'Not delivered',
          description: 'Order not delivered on time',
          evidence: [],
          status: 'investigating' as const,
          createdAt: '2024-01-15',
          messages: [],
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          disputes: mockDisputes,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.disputes.length).toBe(1);
      });

      await act(async () => {
        await result.current.resolveDispute('d1', 'Refund issued', 100);
      });

      expect(result.current.disputes[0].status).toBe('resolved');
    });
  });

  describe('approvePayout', () => {
    it('should approve a payout request', async () => {
      const mockPayouts = [
        {
          id: 'p1',
          sellerId: 's1',
          sellerName: 'Seller',
          amount: 500,
          status: 'pending' as const,
          requestDate: '2024-01-15',
          method: 'bank_transfer',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify({
          adminUser: {
            id: 'admin-123',
            name: 'Admin',
            email: 'admin@platform.com',
            role: 'super_admin',
            permissions: ['all'],
          },
          payoutRequests: mockPayouts,
        })
      );

      const { result } = renderHook(() => useAdmin(), { wrapper });

      await waitFor(() => {
        expect(result.current.payoutRequests.length).toBe(1);
      });

      await act(async () => {
        await result.current.approvePayout('p1');
      });

      expect(result.current.payoutRequests[0].status).toBe('approved');
    });
  });
});
