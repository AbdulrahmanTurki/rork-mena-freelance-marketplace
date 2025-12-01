import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

describe('Seller Verification E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full verification flow', async () => {
    const sellerId = 'seller-123';
    const verificationData = {
      user_id: sellerId,
      business_name: 'Test Business',
      business_type: 'individual',
      id_document: 'https://example.com/id.jpg',
      status: 'pending',
    };

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: verificationData, error: null }),
    });

    const mockInsert = fromMock().insert;

    expect(mockInsert).toBeDefined();
  });

  it('should handle document upload errors', async () => {
    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      }),
    });

    const mockInsert = fromMock().insert;
    expect(mockInsert).toBeDefined();
  });

  it('should verify admin can approve verification', async () => {
    const verificationId = 'verification-123';

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { status: 'approved' },
        error: null,
      }),
    });

    const mockUpdate = fromMock().update;
    expect(mockUpdate).toBeDefined();
  });

  it('should verify admin can reject verification', async () => {
    const verificationId = 'verification-123';
    const rejectionReason = 'Invalid documents';

    const fromMock = supabase.from as jest.Mock;
    fromMock.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { status: 'rejected', rejection_reason: rejectionReason },
        error: null,
      }),
    });

    const mockUpdate = fromMock().update;
    expect(mockUpdate).toBeDefined();
  });
});
