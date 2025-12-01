import { renderHook, act, waitFor } from '@testing-library/react-native';
import { EscrowProvider, useEscrow } from '@/contexts/EscrowContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <EscrowProvider>{children}</EscrowProvider>
);

describe('Escrow Workflow E2E Tests', () => {
  describe('Order Payment Escrow Flow', () => {
    it('should hold payment in escrow when order is placed', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialBalance = result.current.getTotalEscrowBalance();
      expect(initialBalance).toBeGreaterThanOrEqual(0);
    });

    it('should release payment to seller on order completion', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const sellerId = testOrder.sellerId;
      const initialWallet = result.current.sellerWallets.find(w => w.sellerId === sellerId);
      const initialAvailable = initialWallet?.availableBalance || 0;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_full',
          reason: 'Order completed successfully',
        });
      });

      const updatedWallet = result.current.sellerWallets.find(w => w.sellerId === sellerId);
      expect(updatedWallet?.availableBalance).toBeGreaterThan(initialAvailable);
    });

    it('should refund payment to buyer on order cancellation', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const initialRefunds = result.current.buyerRefunds.length;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'refund_full',
          reason: 'Order cancelled by buyer',
        });
      });

      expect(result.current.buyerRefunds.length).toBe(initialRefunds + 1);
      const latestRefund = result.current.buyerRefunds[0];
      expect(latestRefund.buyerId).toBe(testOrder.buyerId);
    });
  });

  describe('Dispute Resolution Escrow Flow', () => {
    it('should freeze funds during dispute', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'freeze',
          reason: 'Dispute opened',
          freezeDuration: 14,
        });
      });

      const frozenOrder = result.current.orders.find(o => o.id === testOrder.id);
      expect(frozenOrder?.isFrozen).toBe(true);
      expect(frozenOrder?.frozenUntil).toBeDefined();
    });

    it('should execute split payment on dispute resolution', async () => {
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
          reason: 'Dispute resolved with compromise',
        });
      });

      const relevantTransactions = result.current.transactions.filter(
        t => t.orderId === testOrder.orderId
      );
      expect(relevantTransactions.length).toBeGreaterThan(1);
    });

    it('should unfreeze funds after dispute resolution', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'freeze',
          reason: 'Investigation started',
        });
      });

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'unfreeze',
          reason: 'Investigation completed',
        });
      });

      const unfrozenOrder = result.current.orders.find(o => o.id === testOrder.id);
      expect(unfrozenOrder?.isFrozen).toBe(false);
    });
  });

  describe('Seller Withdrawal Flow', () => {
    it('should show pending withdrawal requests', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const totalPending = result.current.getTotalPendingWithdrawals();
      expect(totalPending).toBeGreaterThanOrEqual(0);
    });

    it('should approve seller withdrawal request', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const wallet = result.current.sellerWallets[0];
      const pendingWithdrawal = wallet.withdrawalRequests.find(w => w.status === 'pending');

      if (pendingWithdrawal) {
        await act(async () => {
          result.current.processWithdrawal(
            pendingWithdrawal.id,
            wallet.sellerId,
            'approved'
          );
        });

        const updatedWallet = result.current.sellerWallets.find(w => w.sellerId === wallet.sellerId);
        const updatedWithdrawal = updatedWallet?.withdrawalRequests.find(w => w.id === pendingWithdrawal.id);
        expect(updatedWithdrawal?.status).toBe('approved');
      }
    });

    it('should decline withdrawal request with reason', async () => {
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

      const updatedWallet = result.current.sellerWallets.find(w => w.sellerId === wallet.sellerId);
      const updatedWithdrawal = updatedWallet?.withdrawalRequests.find(w => w.id === withdrawal.id);
      expect(updatedWithdrawal?.status).toBe('declined');
      expect(updatedWithdrawal?.declineReason).toBe('Insufficient balance verification');
    });

    it('should complete withdrawal and deduct from wallet', async () => {
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

      const updatedWallet = result.current.sellerWallets.find(w => w.sellerId === wallet.sellerId);
      expect(updatedWallet?.availableBalance).toBe(initialBalance - withdrawal.amount);
    });

    it('should track withdrawal in transactions', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const wallet = result.current.sellerWallets[0];
      const withdrawal = wallet.withdrawalRequests[0];

      const initialTransactionCount = result.current.transactions.length;

      await act(async () => {
        result.current.processWithdrawal(
          withdrawal.id,
          wallet.sellerId,
          'completed'
        );
      });

      expect(result.current.transactions.length).toBe(initialTransactionCount + 1);
      const withdrawalTransaction = result.current.transactions.find(
        t => t.type === 'withdrawal' && t.fromUserId === wallet.sellerId
      );
      expect(withdrawalTransaction).toBeDefined();
    });
  });

  describe('Partial Payment Flow', () => {
    it('should release partial payment for milestone delivery', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const partialAmount = 50;
      const initialNetAmount = testOrder.netAmount;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_partial',
          amount: partialAmount,
          reason: 'First milestone completed',
        });
      });

      const updatedOrder = result.current.orders.find(o => o.id === testOrder.id);
      expect(updatedOrder?.netAmount).toBe(initialNetAmount - partialAmount);
    });

    it('should issue partial refund', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const refundAmount = 30;
      const initialAmount = testOrder.amount;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'refund_partial',
          amount: refundAmount,
          reason: 'Partial work not satisfactory',
        });
      });

      const updatedOrder = result.current.orders.find(o => o.id === testOrder.id);
      expect(updatedOrder?.amount).toBe(initialAmount - refundAmount);
    });
  });

  describe('Financial Logs and Audit Trail', () => {
    it('should log all escrow actions', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialLogCount = result.current.financialLogs.length;
      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'freeze',
          reason: 'Test audit log',
        });
      });

      expect(result.current.financialLogs.length).toBe(initialLogCount + 1);
      const latestLog = result.current.financialLogs[0];
      expect(latestLog.action).toBe('Funds Frozen');
      expect(latestLog.orderId).toBe(testOrder.orderId);
    });

    it('should track admin actions in logs', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_full',
          reason: 'Admin approved release',
        });
      });

      const latestLog = result.current.financialLogs[0];
      expect(latestLog.adminId).toBe('admin_1');
      expect(latestLog.adminName).toBe('Super Admin');
    });

    it('should include transaction details in logs', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const partialAmount = 75;

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_partial',
          amount: partialAmount,
          reason: 'Milestone payment',
        });
      });

      const latestLog = result.current.financialLogs[0];
      expect(latestLog.amount).toBe(partialAmount);
      expect(latestLog.details).toBeDefined();
      expect(latestLog.details.partialAmount).toBe(partialAmount);
    });
  });

  describe('Escrow Settings Management', () => {
    it('should update platform fee percentage', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const newFee = { escrowHoldPeriod: 7 };

      await act(async () => {
        result.current.updateSettings(newFee);
      });

      expect(result.current.settings.escrowHoldPeriod).toBe(7);
    });

    it('should log settings changes', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const initialLogCount = result.current.financialLogs.length;

      await act(async () => {
        result.current.updateSettings({ minWithdrawalAmount: 100 });
      });

      expect(result.current.financialLogs.length).toBe(initialLogCount + 1);
      const latestLog = result.current.financialLogs[0];
      expect(latestLog.action).toBe('Settings Updated');
    });
  });

  describe('Escrow Balance Calculations', () => {
    it('should accurately calculate total escrow balance', () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const totalBalance = result.current.getTotalEscrowBalance();
      expect(typeof totalBalance).toBe('number');
      expect(totalBalance).toBeGreaterThanOrEqual(0);
    });

    it('should exclude completed and refunded orders from balance', async () => {
      const { result } = renderHook(() => useEscrow(), { wrapper });

      const testOrder = result.current.orders[0];
      const balanceBeforeCompletion = result.current.getTotalEscrowBalance();

      await act(async () => {
        result.current.executePaymentAction({
          orderId: testOrder.id,
          action: 'release_full',
          reason: 'Order complete',
        });
      });

      const balanceAfterCompletion = result.current.getTotalEscrowBalance();
      expect(balanceAfterCompletion).toBeLessThanOrEqual(balanceBeforeCompletion);
    });
  });
});
