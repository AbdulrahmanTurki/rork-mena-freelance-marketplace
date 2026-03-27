import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEscrow } from '@/contexts/EscrowContext';
import { DollarSign, Clock, AlertTriangle, CheckCircle, Wallet, TrendingUp } from 'lucide-react-native';

export default function EscrowOverviewScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { orders, getTotalEscrowBalance, getTotalPendingWithdrawals } = useEscrow();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const texts = {
    en: {
      title: 'Escrow Management',
      totalInEscrow: 'Total in Escrow',
      pendingWithdrawals: 'Pending Withdrawals',
      activeOrders: 'Active Orders',
      disputedOrders: 'Disputed Orders',
      search: 'Search by order ID, buyer, or seller...',
      filterAll: 'All',
      filterActive: 'Active',
      filterPending: 'Pending',
      filterDisputed: 'Disputed',
      filterScheduled: 'Scheduled',
      orderId: 'Order ID',
      gig: 'Gig',
      buyer: 'Buyer',
      seller: 'Seller',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      viewDetails: 'View Details',
      noOrders: 'No orders found',
      autoRelease: 'Auto-release in',
      frozen: 'Frozen',
      wallets: 'Wallets',
      refunds: 'Refunds',
      logs: 'Logs',
      settings: 'Settings',
      sar: 'SAR',
      active: 'Active',
      pendingApproval: 'Pending Approval',
      disputed: 'Disputed',
      autoReleaseScheduled: 'Auto-Release Scheduled',
      completed: 'Completed',
      refunded: 'Refunded',
    },
    ar: {
      title: 'إدارة الضمان المالي',
      totalInEscrow: 'إجمالي المبالغ المحتجزة',
      pendingWithdrawals: 'السحوبات المعلقة',
      activeOrders: 'الطلبات النشطة',
      disputedOrders: 'الطلبات المتنازع عليها',
      search: 'البحث برقم الطلب أو المشتري أو البائع...',
      filterAll: 'الكل',
      filterActive: 'نشط',
      filterPending: 'في الانتظار',
      filterDisputed: 'متنازع عليه',
      filterScheduled: 'مجدول',
      orderId: 'رقم الطلب',
      gig: 'الخدمة',
      buyer: 'المشتري',
      seller: 'البائع',
      amount: 'المبلغ',
      status: 'الحالة',
      actions: 'الإجراءات',
      viewDetails: 'عرض التفاصيل',
      noOrders: 'لا توجد طلبات',
      autoRelease: 'التحرير التلقائي خلال',
      frozen: 'مجمد',
      wallets: 'المحافظ',
      refunds: 'المبالغ المستردة',
      logs: 'السجلات',
      settings: 'الإعدادات',
      sar: 'ريال',
      active: 'نشط',
      pendingApproval: 'في انتظار الموافقة',
      disputed: 'متنازع عليه',
      autoReleaseScheduled: 'تحرير تلقائي مجدول',
      completed: 'مكتمل',
      refunded: 'مسترد',
    },
  };

  const t = texts[language];

  const totalEscrow = getTotalEscrowBalance();
  const pendingWithdrawals = getTotalPendingWithdrawals();
  const activeOrdersCount = orders.filter((o) => o.status === 'active').length;
  const disputedOrdersCount = orders.filter((o) => o.status === 'disputed').length;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t.active;
      case 'pending_approval':
        return t.pendingApproval;
      case 'disputed':
        return t.disputed;
      case 'auto_release_scheduled':
        return t.autoReleaseScheduled;
      case 'completed':
        return t.completed;
      case 'refunded':
        return t.refunded;
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#3B82F6';
      case 'pending_approval':
        return '#F59E0B';
      case 'disputed':
        return '#EF4444';
      case 'auto_release_scheduled':
        return '#8B5CF6';
      case 'completed':
        return '#10B981';
      case 'refunded':
        return '#6B7280';
      default:
        return theme.text;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.gigTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && order.status === 'active') ||
      (filterStatus === 'pending' && order.status === 'pending_approval') ||
      (filterStatus === 'disputed' && order.status === 'disputed') ||
      (filterStatus === 'scheduled' && order.status === 'auto_release_scheduled');

    return matchesSearch && matchesFilter;
  });

  const formatTimeUntilRelease = (releaseDate: string) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const diff = release.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t.title,
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <DollarSign size={24} color="#3B82F6" />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {totalEscrow.toLocaleString()} {t.sar}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t.totalInEscrow}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Wallet size={24} color="#F59E0B" />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {pendingWithdrawals.toLocaleString()} {t.sar}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t.pendingWithdrawals}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {activeOrdersCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t.activeOrders}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={[styles.statValue, { color: theme.text }]}>
              {disputedOrdersCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {t.disputedOrders}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/admin/escrow/wallets')}
          >
            <Wallet size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              {t.wallets}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/admin/escrow/refunds')}
          >
            <TrendingUp size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              {t.refunds}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/admin/escrow/logs')}
          >
            <Clock size={20} color={theme.primary} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>
              {t.logs}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchSection, { backgroundColor: theme.card }]}>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t.search}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              filterStatus === 'all' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterStatus('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.text },
                filterStatus === 'all' && { color: '#FFFFFF' },
              ]}
            >
              {t.filterAll}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              filterStatus === 'active' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterStatus('active')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.text },
                filterStatus === 'active' && { color: '#FFFFFF' },
              ]}
            >
              {t.filterActive}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              filterStatus === 'pending' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterStatus('pending')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.text },
                filterStatus === 'pending' && { color: '#FFFFFF' },
              ]}
            >
              {t.filterPending}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              filterStatus === 'disputed' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterStatus('disputed')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.text },
                filterStatus === 'disputed' && { color: '#FFFFFF' },
              ]}
            >
              {t.filterDisputed}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: theme.card },
              filterStatus === 'scheduled' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilterStatus('scheduled')}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: theme.text },
                filterStatus === 'scheduled' && { color: '#FFFFFF' },
              ]}
            >
              {t.filterScheduled}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                {t.noOrders}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/admin/escrow/order/${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={[styles.orderId, { color: theme.text }]}>
                      {order.orderId}
                    </Text>
                    <Text
                      style={[styles.gigTitle, { color: theme.secondaryText }]}
                      numberOfLines={1}
                    >
                      {order.gigTitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                      {t.buyer}:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {order.buyerName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                      {t.seller}:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {order.sellerName}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={[styles.amount, { color: theme.text }]}>
                    {order.amount.toLocaleString()} {t.sar}
                  </Text>
                  {order.isFrozen && (
                    <View style={styles.frozenBadge}>
                      <AlertTriangle size={14} color="#EF4444" />
                      <Text style={styles.frozenText}>{t.frozen}</Text>
                    </View>
                  )}
                  {order.autoReleaseAt && !order.isFrozen && (
                    <View style={styles.autoReleaseBadge}>
                      <Clock size={14} color="#8B5CF6" />
                      <Text style={styles.autoReleaseText}>
                        {formatTimeUntilRelease(order.autoReleaseAt)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.settingsButton,
          { backgroundColor: theme.primary, bottom: 20 + insets.bottom },
        ]}
        onPress={() => router.push('/admin/escrow/settings')}
      >
        <Text style={styles.settingsButtonText}>{t.settings}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  searchSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  ordersContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  gigTitle: {
    fontSize: 13,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  orderDetails: {
    marginBottom: 12,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  detailValue: {
    fontSize: 13,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  frozenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  frozenText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  autoReleaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  autoReleaseText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
