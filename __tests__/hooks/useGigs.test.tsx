import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useGigs,
  useGig,
  useSearchGigs,
  useCreateGig,
  useUpdateGig,
} from '@/hooks/useGigs';
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

describe('useGigs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useGigs', () => {
    it('should fetch all gigs', async () => {
      const mockGigs = [
        {
          id: 'gig-1',
          title: 'Test Gig 1',
          description: 'Description 1',
          price: 100,
          is_active: true,
        },
        {
          id: 'gig-2',
          title: 'Test Gig 2',
          description: 'Description 2',
          price: 200,
          is_active: true,
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockGigs, error: null }),
      });

      const { result } = renderHook(() => useGigs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGigs);
    });

    it('should fetch gigs by category', async () => {
      const mockGigs = [
        {
          id: 'gig-1',
          title: 'Test Gig 1',
          category_id: 'cat-1',
        },
      ];

      const eqMock = jest.fn().mockReturnThis();
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: eqMock,
        order: jest.fn().mockResolvedValue({ data: mockGigs, error: null }),
      });

      const { result } = renderHook(
        () => useGigs({ categoryId: 'cat-1' }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(eqMock).toHaveBeenCalledWith('is_active', true);
      expect(eqMock).toHaveBeenCalledWith('category_id', 'cat-1');
    });

    it('should handle fetch error', async () => {
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error('Fetch failed') }),
      });

      const { result } = renderHook(() => useGigs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useGig', () => {
    it('should fetch single gig with details', async () => {
      const mockGig = {
        id: 'gig-1',
        title: 'Test Gig',
        description: 'Description',
        price: 100,
        seller: {
          id: 'seller-1',
          full_name: 'Test Seller',
        },
        category: {
          id: 'cat-1',
          name: 'Design',
        },
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockGig, error: null }),
      });

      const { result } = renderHook(() => useGig('gig-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGig);
    });
  });

  describe('useSearchGigs', () => {
    it('should search gigs by query', async () => {
      const mockGigs = [
        {
          id: 'gig-1',
          title: 'Logo Design',
          description: 'Professional logo',
        },
      ];

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockGigs, error: null }),
      });

      const { result } = renderHook(() => useSearchGigs('logo'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGigs);
    });

    it('should not fetch with empty query', async () => {
      const { result } = renderHook(() => useSearchGigs(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useCreateGig', () => {
    it('should create a new gig', async () => {
      const newGig = {
        title: 'New Gig',
        description: 'New Description',
        price: 150,
        seller_id: 'seller-1',
        category_id: 'cat-1',
      };

      const mockCreatedGig = {
        id: 'gig-new',
        ...newGig,
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockCreatedGig, error: null }),
      });

      const { result } = renderHook(() => useCreateGig(), {
        wrapper: createWrapper(),
      });

      let createdGig;
      await waitFor(async () => {
        createdGig = await result.current.mutateAsync(newGig);
      });

      expect(createdGig).toEqual(mockCreatedGig);
    });

    it('should handle create error', async () => {
      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({
            data: null,
            error: { message: 'Creation failed' },
          }),
      });

      const { result } = renderHook(() => useCreateGig(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          title: 'New Gig',
          price: 150,
          seller_id: 'seller-1',
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('useUpdateGig', () => {
    it('should update existing gig', async () => {
      const updates = {
        title: 'Updated Title',
        price: 200,
      };

      const mockUpdatedGig = {
        id: 'gig-1',
        ...updates,
      };

      const fromMock = supabase.from as jest.Mock;
      fromMock.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockUpdatedGig, error: null }),
      });

      const { result } = renderHook(() => useUpdateGig(), {
        wrapper: createWrapper(),
      });

      let updatedGig;
      await waitFor(async () => {
        updatedGig = await result.current.mutateAsync({
          id: 'gig-1',
          updates,
        });
      });

      expect(updatedGig).toEqual(mockUpdatedGig);
    });
  });
});
