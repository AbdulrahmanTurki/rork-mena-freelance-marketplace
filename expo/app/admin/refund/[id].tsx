import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, RotateCcw, DollarSign, MessageCircle } from 'lucide-react-native';

export default function RefundDetailScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const isRTL = language === 'ar';

  const refundData = {
    id: id as string,
    orderId: 'ORD-12345',
    buyer: {
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      userId: 'user_123',
    },
    seller: {
      name: 'Sara Mohamed',
      email: 'sara@example.com',
      userId: 'user_456',
    },
    amount: 450.00,
    reason: 'Order cancelled by buyer',
    status: 'pending',
    requestDate: '2024-01-18 14:30:25',
    completedDate: null,
    notes: 'Buyer requested cancellation within 24 hours of order placement.',
  };

  const handleApproveRefund = () => {
    Alert.alert(
      isRTL ? 'الموافقة على الاسترداد' : 'Approve Refund',
      isRTL
        ? 'هل أنت متأكد من الموافقة على هذا الاسترداد؟'
        : 'Are you sure you want to approve this refund?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'موافقة' : 'Approve',
          onPress: () => {
            setIsProcessing(true);
            setTimeout(() => {
              Alert.alert(
                isRTL ? 'نجح' : 'Success',
                isRTL ? 'تم الموافقة على الاسترداد' : 'Refund approved successfully'
              );
              setIsProcessing(false);
              router.back();
            }, 1500);
          },
        },
      ]
    );
  };

  const handleRejectRefund = () => {
    Alert.alert(
      isRTL ? 'رفض الاسترداد' : 'Reject Refund',
      isRTL
        ? 'هل أنت متأكد من رفض هذا الاسترداد؟'
        : 'Are you sure you want to reject this refund?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'رفض' : 'Reject',
          style: 'destructive',
          onPress: () => {
            setIsProcessing(true);
            setTimeout(() => {
              Alert.alert(
                isRTL ? 'نجح' : 'Success',
                isRTL ? 'تم رفض الاسترداد' : 'Refund rejected successfully'
              );
              setIsProcessing(false);
              router.back();
            }, 1500);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'تفاصيل الاسترداد' : 'Refund Details',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor:
                  refundData.status === 'pending'
                    ? '#f59e0b20'
                    : refundData.status === 'completed'
                    ? '#10b98120'
                    : '#ef444420',
              },
            ]}
          >
            {refundData.status === 'pending' ? (
              <RotateCcw size={28} color="#f59e0b" />
            ) : refundData.status === 'completed' ? (
              <CheckCircle size={28} color="#10b981" />
            ) : (
              <XCircle size={28} color="#ef4444" />
            )}
          </View>
          <Text style={[styles.statusTitle, { color: theme.text }]}>
            {refundData.status === 'pending'
              ? isRTL
                ? 'في انتظار المراجعة'
                : 'Pending Review'
              : refundData.status === 'completed'
              ? isRTL
                ? 'مكتمل'
                : 'Completed'
              : isRTL
              ? 'مرفوض'
              : 'Rejected'}
          </Text>
          <Text style={[styles.statusSubtitle, { color: theme.secondaryText }]}>
            {isRTL ? 'تاريخ الطلب:' : 'Requested on:'} {refundData.requestDate}
          </Text>
        </View>

        <View style={[styles.amountCard, { backgroundColor: theme.card }]}>
          <DollarSign size={24} color={theme.primary} />
          <Text style={[styles.amountLabel, { color: theme.secondaryText }]}>
            {isRTL ? 'مبلغ الاسترداد' : 'Refund Amount'}
          </Text>
          <Text style={[styles.amountValue, { color: theme.text }]}>
            {refundData.amount.toFixed(2)} SAR
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
          </Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'رقم الطلب' : 'Order ID'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {refundData.orderId}
            </Text>
          </View>
        </View>

        <View style={[styles.partyCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'المشتري' : 'Buyer'}
          </Text>
          <View style={[styles.partyAvatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.partyAvatarText}>
              {refundData.buyer.name.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.partyName, { color: theme.text }]}>
            {refundData.buyer.name}
          </Text>
          <Text style={[styles.partyEmail, { color: theme.secondaryText }]}>
            {refundData.buyer.email}
          </Text>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => console.log('Contact buyer')}
          >
            <MessageCircle size={16} color={theme.primary} />
            <Text style={[styles.contactButtonText, { color: theme.primary }]}>
              {isRTL ? 'الاتصال' : 'Contact'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.partyCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'البائع' : 'Seller'}
          </Text>
          <View style={[styles.partyAvatar, { backgroundColor: '#8b5cf6' }]}>
            <Text style={styles.partyAvatarText}>
              {refundData.seller.name.charAt(0)}
            </Text>
          </View>
          <Text style={[styles.partyName, { color: theme.text }]}>
            {refundData.seller.name}
          </Text>
          <Text style={[styles.partyEmail, { color: theme.secondaryText }]}>
            {refundData.seller.email}
          </Text>
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => console.log('Contact seller')}
          >
            <MessageCircle size={16} color={theme.primary} />
            <Text style={[styles.contactButtonText, { color: theme.primary }]}>
              {isRTL ? 'الاتصال' : 'Contact'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.notesCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'السبب' : 'Reason'}
          </Text>
          <Text style={[styles.reasonText, { color: theme.text }]}>
            {refundData.reason}
          </Text>
        </View>

        <View style={[styles.notesCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'ملاحظات' : 'Notes'}
          </Text>
          <Text style={[styles.notesText, { color: theme.secondaryText }]}>
            {refundData.notes}
          </Text>
        </View>

        {refundData.status === 'pending' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.approveButton, { backgroundColor: '#10b981' }]}
              onPress={handleApproveRefund}
              disabled={isProcessing}
            >
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isProcessing
                  ? isRTL
                    ? 'جاري المعالجة...'
                    : 'Processing...'
                  : isRTL
                  ? 'الموافقة على الاسترداد'
                  : 'Approve Refund'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: '#ef4444' }]}
              onPress={handleRejectRefund}
              disabled={isProcessing}
            >
              <XCircle size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRTL ? 'رفض الاسترداد' : 'Reject Refund'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  partyCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  partyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  partyAvatarText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#fff',
  },
  partyName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  partyEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  notesCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 15,
    lineHeight: 22,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
    marginTop: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
