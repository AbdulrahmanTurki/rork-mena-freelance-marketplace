import { renderHook, act, waitFor } from '@testing-library/react-native';
import { EscrowProvider, useEscrow } from '@/contexts/EscrowContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EscrowProvider>{children}</EscrowProvider>
);

describe('EscrowContext', () => {
  describe('executePaymentAction', () => {
    it('should release full payment to seller', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialOrders = result.current.orders;
      const testOrder = initialOrders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_full',
          reason: 'Order completed successfully',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.status).toBe('completed');
      expect(updatedOrder?.isFrozen).toBe(false);
      expect(result.current.transactions.length).toBeGreaterThan(0);
    });

    it('should release partial payment to seller', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const partialAmount = 50;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_partial',
          amount: partialAmount,
          reason: 'Partial delivery completed',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.netAmount).toBe(testOrder.netAmount - partialAmount);
    });

    it('should refund full amount to buyer', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const initialRefunds = result.current.buyerRefunds.length;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'refund_full',
          reason: 'Order cancelled',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.status).toBe('refunded');
      expect(result.current.buyerRefunds.length).toBe(initialRefunds + 1);
    });

    it('should refund partial amount to buyer', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const refundAmount = 30;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'refund_partial',
          amount: refundAmount,
          reason: 'Partial refund requested',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.amount).toBe(testOrder.amount - refundAmount);
    });

    it('should execute split payment', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const sellerAmount = 60;
      const buyerAmount = 40;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'split_payment',
          sellerAmount,
          buyerAmount,
          reason: 'Dispute resolved with split',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.status).toBe('completed');
      expect(result.current.transactions.filter(t => t.orderId === testOrder.orderId).length).toBeGreaterThan(1);
    });

    it('should freeze order funds', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'freeze',
          reason: 'Under investigation',
          freezeDuration: 7,
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.isFrozen).toBe(true);
      expect(updatedOrder?.frozenUntil).toBeDefined();
    });

    it('should unfreeze order funds', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'freeze',
          reason: 'Investigation',
        });
      });

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'unfreeze',
          reason: 'Investigation completed',
        });
      });

      const updatedOrder = result.current.orders.find((o) => o.id === testOrder.id);
      expect(updatedOrder?.isFrozen).toBe(false);
      expect(updatedOrder?.frozenUntil).toBeUndefined();
    });
  });

  describe('processWithdrawal', () => {
    it('should approve withdrawal request', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const wallet = result.current.sellerWallets[0];
      const withdrawal = wallet.withdrawalRequests[0];

      await act(async () => {
        result.current.processWithdrawal(
          withdrawal.id,
          wallet.sellerId,
          'approved'
        );
      });

      const updatedWallet = result.current.sellerWallets.find(
        (w) => w.sellerId === wallet.sellerId
      );
      const updatedWithdrawal = updatedWallet?.withdrawalRequests.find(
        (w) => w.id === withdrawal.id
      );

      expect(updatedWithdrawal?.status).toBe('approved');
      expect(updatedWithdrawal?.processedAt).toBeDefined();
    });

    it('should decline withdrawal with reason', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const wallet = result.current.sellerWallets[0];
      const withdrawal = wallet.withdrawalRequests[0];

      await act(async () => {
        result.current.processWithdrawal(
          withdrawal.id,
          wallet.sellerId,
          'declined',
          'Insufficient balance verification'
        );
      });

      const updatedWallet = result.current.sellerWallets.find(
        (w) => w.sellerId === wallet.sellerId
      );
      const updatedWithdrawal = updatedWallet?.withdrawalRequests.find(
        (w) => w.id === withdrawal.id
      );

      expect(updatedWithdrawal?.status).toBe('declined');
      expect(updatedWithdrawal?.declineReason).toBe('Insufficient balance verification');
    });

    it('should complete withdrawal and deduct from balance', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const wallet = result.current.sellerWallets[0];
      const withdrawal = wallet.withdrawalRequests[0];
      const initialBalance = wallet.availableBalance;

      await act(async () => {
        result.current.processWithdrawal(
          withdrawal.id,
          wallet.sellerId,
          'completed'
        );
      });

      const updatedWallet = result.current.sellerWallets.find(
        (w) => w.sellerId === wallet.sellerId
      );

      expect(updatedWallet?.availableBalance).toBe(initialBalance - withdrawal.amount);
      expect(result.current.transactions.some(t => t.type === 'withdrawal')).toBe(true);
    });
  });

  describe('updateSettings', () => {
    it('should update escrow settings', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const newSettings = {
        platformFeePercentage: 12,
        autoReleaseAfterDays: 7,
      };

      await act(async () => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings.platformFeePercentage).toBe(12);
      expect(result.current.settings.autoReleaseAfterDays).toBe(7);
    });
  });

  describe('getTotalEscrowBalance', () => {
    it('should calculate total escrow balance correctly', () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const totalBalance = result.current.getTotalEscrowBalance();

      expect(typeof totalBalance).toBe('number');
      expect(totalBalance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getTotalPendingWithdrawals', () => {
    it('should calculate total pending withdrawals correctly', () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const totalPending = result.current.getTotalPendingWithdrawals();

      expect(typeof totalPending).toBe('number');
      expect(totalPending).toBeGreaterThanOrEqual(0);
    });
  });

  describe('financial logs', () => {
    it('should create financial log for payment action', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialLogCount = result.current.financialLogs.length;
      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_full',
          reason: 'Test log creation',
        });
      });

      expect(result.current.financialLogs.length).toBe(initialLogCount + 1);
      const latestLog = result.current.financialLogs[0];
      expect(latestLog.action).toBe('Payment Released');
    });

    it('should create financial log for settings update', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialLogCount = result.current.financialLogs.length;

      await act(async () => {
        result.current.updateSettings({ platformFeePercentage: 15 });
      });

      expect(result.current.financialLogs.length).toBe(initialLogCount + 1);
      const latestLog = result.current.financialLogs[0];
      expect(latestLog.action).toBe('Settings Updated');
    });
  });
});
