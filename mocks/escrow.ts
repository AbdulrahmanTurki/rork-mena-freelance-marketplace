export type EscrowOrderStatus = 
  | 'active' 
  | 'pending_approval' 
  | 'disputed' 
  | 'auto_release_scheduled' 
  | 'completed' 
  | 'refunded';

export type TransactionType = 
  | 'order_payment' 
  | 'release_to_seller' 
  | 'refund_to_buyer' 
  | 'partial_refund' 
  | 'split_payment' 
  | 'commission_deduction' 
  | 'withdrawal' 
  | 'deposit';

export type WithdrawalStatus = 'pending' | 'approved' | 'declined' | 'completed';

export interface EscrowOrder {
  id: string;
  orderId: string;
  gigTitle: string;
  sellerName: string;
  sellerId: string;
  buyerName: string;
  buyerId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: EscrowOrderStatus;
  createdAt: string;
  deliveredAt?: string;
  autoReleaseAt?: string;
  frozenUntil?: string;
  isFrozen: boolean;
  disputeReason?: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  type: TransactionType;
  amount: number;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
  adminId?: string;
  adminName?: string;
  reason?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface SellerWallet {
  sellerId: string;
  sellerName: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  withdrawalRequests: WithdrawalRequest[];
  lastWithdrawal?: string;
}

export interface WithdrawalRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  requestedAt: string;
  status: WithdrawalStatus;
  payoutMethod: string;
  accountDetails: string;
  processedAt?: string;
  processedBy?: string;
  declineReason?: string;
}

export interface BuyerRefund {
  id: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  gigTitle: string;
  amount: number;
  refundedAt: string;
  reason: string;
  adminId: string;
  adminName: string;
}

export interface FinancialLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  action: string;
  orderId?: string;
  userId?: string;
  userName?: string;
  amount?: number;
  reason: string;
  details: any;
}

export interface EscrowSettings {
  clearancePeriod: number;
  autoReleaseDays: number;
  disputeFreezeDuration: number;
  platformCommission: number;
  serviceFee: number;
  withdrawalFee: number;
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  refundGracePeriod: number;
  allowPartialRefunds: boolean;
  requireApprovalOver: number;
}

export const mockEscrowOrders: EscrowOrder[] = [
  {
    id: 'esc_1',
    orderId: 'ord_1',
    gigTitle: 'تصميم شعار احترافي',
    sellerName: 'أحمد محمد',
    sellerId: 'seller_1',
    buyerName: 'فاطمة علي',
    buyerId: 'buyer_1',
    amount: 500,
    commission: 50,
    netAmount: 450,
    status: 'active',
    createdAt: '2025-01-03T10:00:00Z',
    deliveredAt: '2025-01-05T14:30:00Z',
    autoReleaseAt: '2025-01-12T14:30:00Z',
    isFrozen: false,
  },
  {
    id: 'esc_2',
    orderId: 'ord_2',
    gigTitle: 'Mobile App Development',
    sellerName: 'Mohammed Al-Saudi',
    sellerId: 'seller_2',
    buyerName: 'Sarah Abdullah',
    buyerId: 'buyer_2',
    amount: 3500,
    commission: 350,
    netAmount: 3150,
    status: 'pending_approval',
    createdAt: '2024-12-28T09:00:00Z',
    deliveredAt: '2025-01-04T16:00:00Z',
    autoReleaseAt: '2025-01-11T16:00:00Z',
    isFrozen: false,
  },
  {
    id: 'esc_3',
    orderId: 'ord_3',
    gigTitle: 'إعداد حملة إعلانية',
    sellerName: 'نورا الخالد',
    sellerId: 'seller_3',
    buyerName: 'خالد العمري',
    buyerId: 'buyer_3',
    amount: 1200,
    commission: 120,
    netAmount: 1080,
    status: 'disputed',
    createdAt: '2024-12-20T11:00:00Z',
    deliveredAt: '2025-01-02T10:00:00Z',
    isFrozen: true,
    frozenUntil: '2025-01-15T10:00:00Z',
    disputeReason: 'المشتري غير راضٍ عن جودة العمل المقدم',
  },
  {
    id: 'esc_4',
    orderId: 'ord_4',
    gigTitle: 'Video Editing Services',
    sellerName: 'Layla Hassan',
    sellerId: 'seller_4',
    buyerName: 'Omar Fahad',
    buyerId: 'buyer_4',
    amount: 800,
    commission: 80,
    netAmount: 720,
    status: 'auto_release_scheduled',
    createdAt: '2024-12-25T14:00:00Z',
    deliveredAt: '2025-01-01T09:00:00Z',
    autoReleaseAt: '2025-01-08T09:00:00Z',
    isFrozen: false,
  },
  {
    id: 'esc_5',
    orderId: 'ord_5',
    gigTitle: 'ترجمة محتوى تسويقي',
    sellerName: 'يوسف الدوسري',
    sellerId: 'seller_5',
    buyerName: 'ريم العتيبي',
    buyerId: 'buyer_5',
    amount: 600,
    commission: 60,
    netAmount: 540,
    status: 'active',
    createdAt: '2024-12-30T08:00:00Z',
    isFrozen: false,
  },
  {
    id: 'esc_6',
    orderId: 'ord_6',
    gigTitle: 'SEO Optimization Package',
    sellerName: 'Abdullah Mansour',
    sellerId: 'seller_6',
    buyerName: 'Maha Al-Qahtani',
    buyerId: 'buyer_6',
    amount: 2000,
    commission: 200,
    netAmount: 1800,
    status: 'disputed',
    createdAt: '2024-12-15T13:00:00Z',
    deliveredAt: '2024-12-28T11:00:00Z',
    isFrozen: true,
    frozenUntil: '2025-01-20T11:00:00Z',
    disputeReason: 'Buyer claims work not completed as agreed',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    orderId: 'ord_1',
    type: 'order_payment',
    amount: 500,
    fromUserId: 'buyer_1',
    fromUserName: 'فاطمة علي',
    toUserId: 'escrow',
    toUserName: 'Escrow Account',
    timestamp: '2025-01-03T10:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn_2',
    orderId: 'ord_2',
    type: 'order_payment',
    amount: 3500,
    fromUserId: 'buyer_2',
    fromUserName: 'Sarah Abdullah',
    toUserId: 'escrow',
    toUserName: 'Escrow Account',
    timestamp: '2024-12-28T09:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn_3',
    orderId: 'ord_3',
    type: 'order_payment',
    amount: 1200,
    fromUserId: 'buyer_3',
    fromUserName: 'خالد العمري',
    toUserId: 'escrow',
    toUserName: 'Escrow Account',
    timestamp: '2024-12-20T11:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn_4',
    orderId: 'ord_7',
    type: 'release_to_seller',
    amount: 450,
    fromUserId: 'escrow',
    fromUserName: 'Escrow Account',
    toUserId: 'seller_7',
    toUserName: 'Hanan Al-Otaibi',
    adminId: 'admin_1',
    adminName: 'Super Admin',
    reason: 'Order completed successfully',
    timestamp: '2024-12-30T10:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn_5',
    orderId: 'ord_8',
    type: 'refund_to_buyer',
    amount: 700,
    fromUserId: 'escrow',
    fromUserName: 'Escrow Account',
    toUserId: 'buyer_7',
    toUserName: 'Nasser Ibrahim',
    adminId: 'admin_1',
    adminName: 'Super Admin',
    reason: 'Work not delivered as agreed',
    timestamp: '2024-12-29T15:30:00Z',
    status: 'completed',
  },
  {
    id: 'txn_6',
    orderId: 'ord_9',
    type: 'partial_refund',
    amount: 300,
    fromUserId: 'escrow',
    fromUserName: 'Escrow Account',
    toUserId: 'buyer_8',
    toUserName: 'Aisha Mohammed',
    adminId: 'admin_2',
    adminName: 'Finance Admin',
    reason: 'Partial work completed, agreed settlement',
    timestamp: '2024-12-28T12:00:00Z',
    status: 'completed',
  },
  {
    id: 'txn_7',
    orderId: 'ord_10',
    type: 'commission_deduction',
    amount: 120,
    fromUserId: 'escrow',
    fromUserName: 'Escrow Account',
    toUserId: 'platform',
    toUserName: 'Platform Revenue',
    timestamp: '2024-12-27T09:00:00Z',
    status: 'completed',
  },
];

export const mockSellerWallets: SellerWallet[] = [
  {
    sellerId: 'seller_1',
    sellerName: 'أحمد محمد',
    availableBalance: 2450,
    pendingBalance: 450,
    totalEarned: 12500,
    lastWithdrawal: '2024-12-20T10:00:00Z',
    withdrawalRequests: [],
  },
  {
    sellerId: 'seller_2',
    sellerName: 'Mohammed Al-Saudi',
    availableBalance: 8900,
    pendingBalance: 3150,
    totalEarned: 45000,
    lastWithdrawal: '2024-12-15T14:00:00Z',
    withdrawalRequests: [
      {
        id: 'wd_1',
        sellerId: 'seller_2',
        sellerName: 'Mohammed Al-Saudi',
        amount: 5000,
        requestedAt: '2025-01-04T10:00:00Z',
        status: 'pending',
        payoutMethod: 'Bank Transfer',
        accountDetails: 'SA12 3456 7890 1234 5678 9012',
      },
    ],
  },
  {
    sellerId: 'seller_3',
    sellerName: 'نورا الخالد',
    availableBalance: 3200,
    pendingBalance: 0,
    totalEarned: 18500,
    lastWithdrawal: '2024-12-10T09:00:00Z',
    withdrawalRequests: [
      {
        id: 'wd_2',
        sellerId: 'seller_3',
        sellerName: 'نورا الخالد',
        amount: 3000,
        requestedAt: '2025-01-05T11:00:00Z',
        status: 'approved',
        payoutMethod: 'Bank Transfer',
        accountDetails: 'SA98 7654 3210 9876 5432 1098',
        processedAt: '2025-01-05T14:00:00Z',
        processedBy: 'admin_2',
      },
    ],
  },
  {
    sellerId: 'seller_4',
    sellerName: 'Layla Hassan',
    availableBalance: 1250,
    pendingBalance: 720,
    totalEarned: 9800,
    withdrawalRequests: [],
  },
  {
    sellerId: 'seller_5',
    sellerName: 'يوسف الدوسري',
    availableBalance: 4100,
    pendingBalance: 540,
    totalEarned: 22000,
    lastWithdrawal: '2024-12-28T13:00:00Z',
    withdrawalRequests: [],
  },
  {
    sellerId: 'seller_6',
    sellerName: 'Abdullah Mansour',
    availableBalance: 6700,
    pendingBalance: 0,
    totalEarned: 38500,
    lastWithdrawal: '2024-12-22T10:00:00Z',
    withdrawalRequests: [
      {
        id: 'wd_3',
        sellerId: 'seller_6',
        sellerName: 'Abdullah Mansour',
        amount: 1000,
        requestedAt: '2025-01-02T09:00:00Z',
        status: 'declined',
        payoutMethod: 'Bank Transfer',
        accountDetails: 'SA11 2233 4455 6677 8899 0011',
        processedAt: '2025-01-03T10:00:00Z',
        processedBy: 'admin_2',
        declineReason: 'Account verification pending',
      },
    ],
  },
];

export const mockBuyerRefunds: BuyerRefund[] = [
  {
    id: 'ref_1',
    buyerId: 'buyer_7',
    buyerName: 'Nasser Ibrahim',
    orderId: 'ord_8',
    gigTitle: 'Website Development',
    amount: 700,
    refundedAt: '2024-12-29T15:30:00Z',
    reason: 'Work not delivered as agreed',
    adminId: 'admin_1',
    adminName: 'Super Admin',
  },
  {
    id: 'ref_2',
    buyerId: 'buyer_8',
    buyerName: 'Aisha Mohammed',
    orderId: 'ord_9',
    gigTitle: 'Content Writing Package',
    amount: 300,
    refundedAt: '2024-12-28T12:00:00Z',
    reason: 'Partial work completed, agreed settlement',
    adminId: 'admin_2',
    adminName: 'Finance Admin',
  },
  {
    id: 'ref_3',
    buyerId: 'buyer_9',
    buyerName: 'علي الشمري',
    orderId: 'ord_11',
    gigTitle: 'تصميم بروشور',
    amount: 450,
    refundedAt: '2024-12-25T10:00:00Z',
    reason: 'البائع لم يسلم المشروع',
    adminId: 'admin_1',
    adminName: 'Super Admin',
  },
];

export const mockFinancialLogs: FinancialLog[] = [
  {
    id: 'log_1',
    timestamp: '2025-01-05T14:00:00Z',
    adminId: 'admin_2',
    adminName: 'Finance Admin',
    action: 'Withdrawal Approved',
    userId: 'seller_3',
    userName: 'نورا الخالد',
    amount: 3000,
    reason: 'All requirements met',
    details: {
      withdrawalId: 'wd_2',
      payoutMethod: 'Bank Transfer',
    },
  },
  {
    id: 'log_2',
    timestamp: '2025-01-04T16:00:00Z',
    adminId: 'admin_1',
    adminName: 'Super Admin',
    action: 'Funds Frozen',
    orderId: 'ord_3',
    userId: 'seller_3',
    userName: 'نورا الخالد',
    amount: 1080,
    reason: 'Dispute initiated by buyer',
    details: {
      frozenUntil: '2025-01-15T10:00:00Z',
      disputeReason: 'المشتري غير راضٍ عن جودة العمل المقدم',
    },
  },
  {
    id: 'log_3',
    timestamp: '2025-01-03T10:00:00Z',
    adminId: 'admin_2',
    adminName: 'Finance Admin',
    action: 'Withdrawal Declined',
    userId: 'seller_6',
    userName: 'Abdullah Mansour',
    amount: 1000,
    reason: 'Account verification pending',
    details: {
      withdrawalId: 'wd_3',
    },
  },
  {
    id: 'log_4',
    timestamp: '2024-12-30T10:00:00Z',
    adminId: 'admin_1',
    adminName: 'Super Admin',
    action: 'Payment Released',
    orderId: 'ord_7',
    userId: 'seller_7',
    userName: 'Hanan Al-Otaibi',
    amount: 450,
    reason: 'Order completed successfully',
    details: {
      autoRelease: false,
      manualApproval: true,
    },
  },
  {
    id: 'log_5',
    timestamp: '2024-12-29T15:30:00Z',
    adminId: 'admin_1',
    adminName: 'Super Admin',
    action: 'Full Refund Issued',
    orderId: 'ord_8',
    userId: 'buyer_7',
    userName: 'Nasser Ibrahim',
    amount: 700,
    reason: 'Work not delivered as agreed',
    details: {
      refundMethod: 'original_payment_method',
    },
  },
  {
    id: 'log_6',
    timestamp: '2024-12-28T12:00:00Z',
    adminId: 'admin_2',
    adminName: 'Finance Admin',
    action: 'Partial Refund Issued',
    orderId: 'ord_9',
    userId: 'buyer_8',
    userName: 'Aisha Mohammed',
    amount: 300,
    reason: 'Partial work completed, agreed settlement',
    details: {
      originalAmount: 800,
      refundAmount: 300,
      sellerReceived: 450,
    },
  },
  {
    id: 'log_7',
    timestamp: '2024-12-27T09:00:00Z',
    adminId: 'system',
    adminName: 'System Auto',
    action: 'Auto-Release Scheduled',
    orderId: 'ord_4',
    userId: 'seller_4',
    userName: 'Layla Hassan',
    amount: 720,
    reason: 'No buyer action within 7 days of delivery',
    details: {
      deliveredAt: '2025-01-01T09:00:00Z',
      autoReleaseAt: '2025-01-08T09:00:00Z',
    },
  },
];

export const mockEscrowSettings: EscrowSettings = {
  clearancePeriod: 3,
  autoReleaseDays: 7,
  disputeFreezeDuration: 14,
  platformCommission: 10,
  serviceFee: 2,
  withdrawalFee: 1.5,
  minimumWithdrawal: 100,
  maximumWithdrawal: 50000,
  refundGracePeriod: 24,
  allowPartialRefunds: true,
  requireApprovalOver: 10000,
};
