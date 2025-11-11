import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback } from 'react';
import {
  mockEscrowOrders,
  mockTransactions,
  mockSellerWallets,
  mockBuyerRefunds,
  mockFinancialLogs,
  mockEscrowSettings,
  EscrowOrder,
  Transaction,
  SellerWallet,
  WithdrawalRequest,
  BuyerRefund,
  FinancialLog,
  EscrowSettings,
  EscrowOrderStatus,
  WithdrawalStatus,
} from '@/mocks/escrow';

export type PaymentAction = 
  | 'release_full' 
  | 'release_partial' 
  | 'refund_full' 
  | 'refund_partial' 
  | 'split_payment' 
  | 'freeze' 
  | 'unfreeze';

export interface PaymentActionParams {
  orderId: string;
  action: PaymentAction;
  amount?: number;
  reason: string;
  sellerAmount?: number;
  buyerAmount?: number;
  freezeDuration?: number;
}

export const [EscrowProvider, useEscrow] = createContextHook(() => {
  const [orders, setOrders] = useState<EscrowOrder[]>(mockEscrowOrders);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [sellerWallets, setSellerWallets] = useState<SellerWallet[]>(mockSellerWallets);
  const [buyerRefunds, setBuyerRefunds] = useState<BuyerRefund[]>(mockBuyerRefunds);
  const [financialLogs, setFinancialLogs] = useState<FinancialLog[]>(mockFinancialLogs);
  const [settings, setSettings] = useState<EscrowSettings>(mockEscrowSettings);

  const addFinancialLog = (
    action: string,
    orderId: string | undefined,
    userId: string | undefined,
    userName: string | undefined,
    amount: number | undefined,
    reason: string,
    details: any
  ) => {
    const newLog: FinancialLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminId: 'admin_1',
      adminName: 'Super Admin',
      action,
      orderId,
      userId,
      userName,
      amount,
      reason,
      details,
    };
    setFinancialLogs((prev) => [newLog, ...prev]);
  };

  const executePaymentAction = useCallback((params: PaymentActionParams) => {
    const order = orders.find((o) => o.id === params.orderId);
    if (!order) return;

    console.log('Executing payment action:', params);

    switch (params.action) {
      case 'release_full':
        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, status: 'completed' as EscrowOrderStatus, isFrozen: false }
              : o
          )
        );

        const sellerWallet = sellerWallets.find((w) => w.sellerId === order.sellerId);
        if (sellerWallet) {
          setSellerWallets((prev) =>
            prev.map((w) =>
              w.sellerId === order.sellerId
                ? {
                    ...w,
                    availableBalance: w.availableBalance + order.netAmount,
                    pendingBalance: Math.max(0, w.pendingBalance - order.netAmount),
                  }
                : w
            )
          );
        }

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}`,
            orderId: order.orderId,
            type: 'release_to_seller',
            amount: order.netAmount,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.sellerId,
            toUserName: order.sellerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);

        addFinancialLog(
          'Payment Released',
          order.orderId,
          order.sellerId,
          order.sellerName,
          order.netAmount,
          params.reason,
          { fullRelease: true }
        );
        break;

      case 'release_partial':
        if (!params.amount) return;

        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, netAmount: o.netAmount - params.amount! }
              : o
          )
        );

        const partialSellerWallet = sellerWallets.find((w) => w.sellerId === order.sellerId);
        if (partialSellerWallet) {
          setSellerWallets((prev) =>
            prev.map((w) =>
              w.sellerId === order.sellerId
                ? {
                    ...w,
                    availableBalance: w.availableBalance + params.amount!,
                    pendingBalance: Math.max(0, w.pendingBalance - params.amount!),
                  }
                : w
            )
          );
        }

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}`,
            orderId: order.orderId,
            type: 'release_to_seller',
            amount: params.amount!,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.sellerId,
            toUserName: order.sellerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);

        addFinancialLog(
          'Partial Payment Released',
          order.orderId,
          order.sellerId,
          order.sellerName,
          params.amount,
          params.reason,
          { partialAmount: params.amount, remainingAmount: order.netAmount - params.amount }
        );
        break;

      case 'refund_full':
        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, status: 'refunded' as EscrowOrderStatus, isFrozen: false }
              : o
          )
        );

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}`,
            orderId: order.orderId,
            type: 'refund_to_buyer',
            amount: order.amount,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.buyerId,
            toUserName: order.buyerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);

        setBuyerRefunds((prev) => [
          {
            id: `ref_${Date.now()}`,
            buyerId: order.buyerId,
            buyerName: order.buyerName,
            orderId: order.orderId,
            gigTitle: order.gigTitle,
            amount: order.amount,
            refundedAt: new Date().toISOString(),
            reason: params.reason,
            adminId: 'admin_1',
            adminName: 'Super Admin',
          },
          ...prev,
        ]);

        addFinancialLog(
          'Full Refund Issued',
          order.orderId,
          order.buyerId,
          order.buyerName,
          order.amount,
          params.reason,
          { fullRefund: true }
        );
        break;

      case 'refund_partial':
        if (!params.amount) return;

        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, amount: o.amount - params.amount!, netAmount: o.netAmount - params.amount! }
              : o
          )
        );

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}`,
            orderId: order.orderId,
            type: 'partial_refund',
            amount: params.amount!,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.buyerId,
            toUserName: order.buyerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);

        setBuyerRefunds((prev) => [
          {
            id: `ref_${Date.now()}`,
            buyerId: order.buyerId,
            buyerName: order.buyerName,
            orderId: order.orderId,
            gigTitle: order.gigTitle,
            amount: params.amount!,
            refundedAt: new Date().toISOString(),
            reason: params.reason,
            adminId: 'admin_1',
            adminName: 'Super Admin',
          },
          ...prev,
        ]);

        addFinancialLog(
          'Partial Refund Issued',
          order.orderId,
          order.buyerId,
          order.buyerName,
          params.amount,
          params.reason,
          { partialAmount: params.amount, remainingAmount: order.amount - params.amount }
        );
        break;

      case 'split_payment':
        if (!params.sellerAmount || !params.buyerAmount) return;

        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, status: 'completed' as EscrowOrderStatus, isFrozen: false }
              : o
          )
        );

        const splitSellerWallet = sellerWallets.find((w) => w.sellerId === order.sellerId);
        if (splitSellerWallet) {
          setSellerWallets((prev) =>
            prev.map((w) =>
              w.sellerId === order.sellerId
                ? {
                    ...w,
                    availableBalance: w.availableBalance + params.sellerAmount!,
                    pendingBalance: Math.max(0, w.pendingBalance - params.sellerAmount!),
                  }
                : w
            )
          );
        }

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}_seller`,
            orderId: order.orderId,
            type: 'split_payment',
            amount: params.sellerAmount!,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.sellerId,
            toUserName: order.sellerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          {
            id: `txn_${Date.now()}_buyer`,
            orderId: order.orderId,
            type: 'split_payment',
            amount: params.buyerAmount!,
            fromUserId: 'escrow',
            fromUserName: 'Escrow Account',
            toUserId: order.buyerId,
            toUserName: order.buyerName,
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: params.reason,
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);

        setBuyerRefunds((prev) => [
          {
            id: `ref_${Date.now()}`,
            buyerId: order.buyerId,
            buyerName: order.buyerName,
            orderId: order.orderId,
            gigTitle: order.gigTitle,
            amount: params.buyerAmount!,
            refundedAt: new Date().toISOString(),
            reason: params.reason,
            adminId: 'admin_1',
            adminName: 'Super Admin',
          },
          ...prev,
        ]);

        addFinancialLog(
          'Split Payment Executed',
          order.orderId,
          undefined,
          undefined,
          order.amount,
          params.reason,
          {
            sellerAmount: params.sellerAmount,
            buyerAmount: params.buyerAmount,
          }
        );
        break;

      case 'freeze':
        const freezeUntil = new Date();
        freezeUntil.setDate(freezeUntil.getDate() + (params.freezeDuration || 14));

        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, isFrozen: true, frozenUntil: freezeUntil.toISOString() }
              : o
          )
        );

        addFinancialLog(
          'Funds Frozen',
          order.orderId,
          order.sellerId,
          order.sellerName,
          order.netAmount,
          params.reason,
          { frozenUntil: freezeUntil.toISOString() }
        );
        break;

      case 'unfreeze':
        setOrders((prev) =>
          prev.map((o) =>
            o.id === params.orderId
              ? { ...o, isFrozen: false, frozenUntil: undefined }
              : o
          )
        );

        addFinancialLog(
          'Funds Unfrozen',
          order.orderId,
          order.sellerId,
          order.sellerName,
          order.netAmount,
          params.reason,
          { unfrozenAt: new Date().toISOString() }
        );
        break;
    }
  }, [orders, sellerWallets]);

  const processWithdrawal = useCallback((
    withdrawalId: string,
    sellerId: string,
    status: WithdrawalStatus,
    declineReason?: string
  ) => {
    console.log('Processing withdrawal:', withdrawalId, status);

    setSellerWallets((prev) =>
      prev.map((wallet) => {
        if (wallet.sellerId !== sellerId) return wallet;

        const withdrawal = wallet.withdrawalRequests.find((w) => w.id === withdrawalId);
        if (!withdrawal) return wallet;

        const updatedRequest: WithdrawalRequest = {
          ...withdrawal,
          status,
          processedAt: new Date().toISOString(),
          processedBy: 'admin_1',
          declineReason,
        };

        if (status === 'completed') {
          return {
            ...wallet,
            availableBalance: wallet.availableBalance - withdrawal.amount,
            withdrawalRequests: wallet.withdrawalRequests.map((w) =>
              w.id === withdrawalId ? updatedRequest : w
            ),
            lastWithdrawal: new Date().toISOString(),
          };
        }

        return {
          ...wallet,
          withdrawalRequests: wallet.withdrawalRequests.map((w) =>
            w.id === withdrawalId ? updatedRequest : w
          ),
        };
      })
    );

    const wallet = sellerWallets.find((w) => w.sellerId === sellerId);
    const withdrawal = wallet?.withdrawalRequests.find((w) => w.id === withdrawalId);

    if (withdrawal) {
      if (status === 'approved') {
        addFinancialLog(
          'Withdrawal Approved',
          undefined,
          sellerId,
          withdrawal.sellerName,
          withdrawal.amount,
          'Withdrawal request approved',
          { withdrawalId, payoutMethod: withdrawal.payoutMethod }
        );
      } else if (status === 'declined') {
        addFinancialLog(
          'Withdrawal Declined',
          undefined,
          sellerId,
          withdrawal.sellerName,
          withdrawal.amount,
          declineReason || 'Withdrawal request declined',
          { withdrawalId }
        );
      } else if (status === 'completed') {
        addFinancialLog(
          'Withdrawal Completed',
          undefined,
          sellerId,
          withdrawal.sellerName,
          withdrawal.amount,
          'Payout successfully sent',
          { withdrawalId, payoutMethod: withdrawal.payoutMethod }
        );

        setTransactions((prev) => [
          {
            id: `txn_${Date.now()}`,
            orderId: 'withdrawal',
            type: 'withdrawal',
            amount: withdrawal.amount,
            fromUserId: sellerId,
            fromUserName: withdrawal.sellerName,
            toUserId: 'external',
            toUserName: 'External Account',
            adminId: 'admin_1',
            adminName: 'Super Admin',
            reason: 'Withdrawal completed',
            timestamp: new Date().toISOString(),
            status: 'completed',
          },
          ...prev,
        ]);
      }
    }
  }, [sellerWallets]);

  const updateSettings = useCallback((newSettings: Partial<EscrowSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    console.log('Escrow settings updated:', newSettings);

    addFinancialLog(
      'Settings Updated',
      undefined,
      undefined,
      undefined,
      undefined,
      'Escrow system settings modified',
      { updatedFields: Object.keys(newSettings), newSettings }
    );
  }, []);

  const getTotalEscrowBalance = useCallback(() => {
    return orders
      .filter((o) => o.status !== 'completed' && o.status !== 'refunded')
      .reduce((sum, o) => sum + o.amount, 0);
  }, [orders]);

  const getTotalPendingWithdrawals = useCallback(() => {
    return sellerWallets.reduce(
      (sum, w) =>
        sum +
        w.withdrawalRequests
          .filter((r) => r.status === 'pending' || r.status === 'approved')
          .reduce((s, r) => s + r.amount, 0),
      0
    );
  }, [sellerWallets]);

  return useMemo(() => ({
    orders,
    transactions,
    sellerWallets,
    buyerRefunds,
    financialLogs,
    settings,
    executePaymentAction,
    processWithdrawal,
    updateSettings,
    getTotalEscrowBalance,
    getTotalPendingWithdrawals,
  }), [orders, transactions, sellerWallets, buyerRefunds, financialLogs, settings, executePaymentAction, processWithdrawal, updateSettings, getTotalEscrowBalance, getTotalPendingWithdrawals]);
});
