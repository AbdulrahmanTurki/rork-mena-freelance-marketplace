import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RotateCcw, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react-native';

export default function EscrowRefundsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isRTL = language === 'ar';

  const refunds = [
    {
      id: 'refund_1',
      orderId: 'ORD-12345',
      buyer: 'Ahmed Hassan',
      seller: 'Sara Mohamed',
      amount: 450.00,
      reason: 'Order cancelled by buyer',
      status: 'completed',
      requestDate: '2024-01-15',
      completedDate: '2024-01-16',
    },
    {
      id: 'refund_2',
      orderId: 'ORD-12346',
      buyer: 'Khaled Ali',
      seller: 'Noor Hassan',
      amount: 320.00,
      reason: 'Seller did not deliver',
      status: 'pending',
      requestDate: '2024-01-18',
      completedDate: null,
    },
    {
      id: 'refund_3',
      orderId: 'ORD-12347',
      buyer: 'Fatima Ahmed',
      seller: 'Mohamed Ali',
      amount: 580.00,
      reason: 'Quality issues',
      status: 'rejected',
      requestDate: '2024-01-17',
      completedDate: '2024-01-18',
    },
  ];

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch =
      refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} color="#10b981" />;
      case 'pending':
        return <Clock size={18} color="#f59e0b" />;
      case 'rejected':
        return <XCircle size={18} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'المبالغ المستردة' : 'Refunds',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'البحث برقم الطلب...' : 'Search by order ID...'}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {['all', 'pending', 'completed', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  statusFilter === status ? theme.primary : theme.card,
              },
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    statusFilter === status ? '#fff' : theme.text,
                },
              ]}
            >
              {status === 'all'
                ? isRTL
                  ? 'الكل'
                  : 'All'
                : status === 'pending'
                ? isRTL
                  ? 'قيد الانتظار'
                  : 'Pending'
                : status === 'completed'
                ? isRTL
                  ? 'مكتمل'
                  : 'Completed'
                : isRTL
                ? 'مرفوض'
                : 'Rejected'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredRefunds.map((refund) => (
          <TouchableOpacity
            key={refund.id}
            style={[styles.refundCard, { backgroundColor: theme.card }]}
            onPress={() => router.push(`/admin/refund/${refund.id}` as any)}
          >
            <View style={styles.refundHeader}>
              <View>
                <Text style={[styles.orderId, { color: theme.text }]}>
                  {refund.orderId}
                </Text>
                <Text style={[styles.refundDate, { color: theme.secondaryText }]}>
                  {isRTL ? 'تاريخ الطلب:' : 'Requested:'} {refund.requestDate}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(refund.status) + '20' },
                ]}
              >
                {getStatusIcon(refund.status)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(refund.status) },
                  ]}
                >
                  {refund.status === 'completed'
                    ? isRTL
                      ? 'مكتمل'
                      : 'Completed'
                    : refund.status === 'pending'
                    ? isRTL
                      ? 'قيد الانتظار'
                      : 'Pending'
                    : isRTL
                    ? 'مرفوض'
                    : 'Rejected'}
                </Text>
              </View>
            </View>

            <View style={styles.refundDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'المشتري' : 'Buyer'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {refund.buyer}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'البائع' : 'Seller'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {refund.seller}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'السبب' : 'Reason'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
                  {refund.reason}
                </Text>
              </View>
            </View>

            <View style={styles.refundFooter}>
              <View style={styles.amountContainer}>
                <RotateCcw size={18} color={theme.primary} />
                <Text style={[styles.amount, { color: theme.text }]}>
                  {refund.amount.toFixed(2)} SAR
                </Text>
              </View>
              {refund.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={() => console.log('Process refund:', refund.id)}
                >
                  <Text style={styles.actionButtonText}>
                    {isRTL ? 'معالجة' : 'Process'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  refundCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  refundDate: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  refundDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
  refundFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
