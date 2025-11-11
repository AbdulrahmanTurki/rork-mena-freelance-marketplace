import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, PayoutRequest } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react-native';

export default function PaymentsRevenueScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { payoutRequests, orders, approvePayout, rejectPayout } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isRTL = language === 'ar';

  const filteredPayouts = payoutRequests.filter(payout => {
    const matchesSearch = payout.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payout.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);
  const commission = totalRevenue * 0.15;
  const totalPayouts = payoutRequests
    .filter(p => p.status === 'approved' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payoutRequests
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'processing':
        return '#3b82f6';
      case 'completed':
        return '#6b7280';
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'pending':
          return 'معلق';
        case 'approved':
          return 'موافق عليه';
        case 'rejected':
          return 'مرفوض';
        case 'processing':
          return 'قيد المعالجة';
        case 'completed':
          return 'مكتمل';
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleApprove = async () => {
    if (selectedPayout) {
      await approvePayout(selectedPayout.id);
      setShowPayoutModal(false);
      setSelectedPayout(null);
    }
  };

  const handleReject = async () => {
    if (selectedPayout && rejectReason) {
      await rejectPayout(selectedPayout.id, rejectReason);
      setShowPayoutModal(false);
      setSelectedPayout(null);
      setRejectReason('');
    }
  };

  const PayoutCard = ({ payout }: { payout: PayoutRequest }) => (
    <TouchableOpacity
      style={[styles.payoutCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedPayout(payout);
        setShowPayoutModal(true);
      }}
    >
      <View style={styles.payoutHeader}>
        <View style={styles.payoutInfo}>
          <Text style={[styles.sellerName, { color: theme.text }]}>
            {payout.sellerName}
          </Text>
          <Text style={[styles.method, { color: theme.secondaryText }]}>
            {payout.method}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payout.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(payout.status) }]}>
            {getStatusText(payout.status)}
          </Text>
        </View>
      </View>
      <View style={styles.payoutFooter}>
        <Text style={[styles.amount, { color: theme.primary }]}>{payout.amount} {isRTL ? 'ريال' : 'SAR'}</Text>
        <Text style={[styles.date, { color: theme.tertiaryText }]}>
          {new Date(payout.requestDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'المدفوعات والإيرادات' : 'Payments & Revenue',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.revenueGrid}>
            <View style={[styles.revenueCard, { backgroundColor: theme.card }]}>
              <DollarSign size={24} color="#10b981" />
              <Text style={[styles.revenueValue, { color: theme.text }]}>
                {totalRevenue.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
              </Text>
              <Text style={[styles.revenueLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </Text>
            </View>
            <View style={[styles.revenueCard, { backgroundColor: theme.card }]}>
              <TrendingUp size={24} color="#8b5cf6" />
              <Text style={[styles.revenueValue, { color: theme.text }]}>
                {commission.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
              </Text>
              <Text style={[styles.revenueLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'العمولة (15%)' : 'Commission (15%)'}
              </Text>
            </View>
          </View>

          <View style={styles.payoutStats}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <CheckCircle size={20} color="#10b981" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalPayouts.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'إجمالي المدفوعات' : 'Total Payouts'}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Clock size={20} color="#f59e0b" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {pendingPayouts.toLocaleString()} {isRTL ? 'ريال' : 'SAR'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'معلق' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
            <Search size={20} color={theme.tertiaryText} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={isRTL ? 'بحث...' : 'Search...'}
              placeholderTextColor={theme.tertiaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.filterChips}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filterStatus === status ? theme.primary : theme.card,
                    },
                  ]}
                  onPress={() => setFilterStatus(status as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: filterStatus === status ? '#fff' : theme.text },
                    ]}
                  >
                    {status === 'all' ? (isRTL ? 'الكل' : 'All') : getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.content}>
          {filteredPayouts.map(payout => (
            <PayoutCard key={payout.id} payout={payout} />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showPayoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedPayout && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {isRTL ? 'طلب سحب' : 'Payout Request'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPayoutModal(false)}>
                    <XCircle size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'البائع' : 'Seller'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedPayout.sellerName}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'المبلغ' : 'Amount'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.primary }]}>
                      {selectedPayout.amount} {isRTL ? 'ريال' : 'SAR'}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedPayout.method}
                    </Text>
                  </View>

                  {selectedPayout.status === 'pending' && (
                    <TextInput
                      style={[
                        styles.reasonInput,
                        {
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder={isRTL ? 'سبب الرفض (اختياري)' : 'Rejection reason (optional)'}
                      placeholderTextColor={theme.tertiaryText}
                      value={rejectReason}
                      onChangeText={setRejectReason}
                      multiline
                    />
                  )}
                </View>

                {selectedPayout.status === 'pending' && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                      onPress={handleApprove}
                    >
                      <CheckCircle size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {isRTL ? 'موافقة' : 'Approve'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={handleReject}
                      disabled={!rejectReason}
                    >
                      <XCircle size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {isRTL ? 'رفض' : 'Reject'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  revenueGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  revenueCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  revenueLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  payoutStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterChips: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  payoutCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  payoutInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  method: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  payoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  date: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  modalBody: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
