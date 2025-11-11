import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  Lock,
  Unlock,
  Ban,
  CheckCircle,
} from 'lucide-react-native';

export default function WalletDetailScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const isRTL = language === 'ar';

  const walletData = {
    id: 'wallet_1',
    userId: id as string,
    userName: 'Ahmed Hassan',
    email: 'ahmed.hassan@example.com',
    balance: 2450.50,
    pending: 500.00,
    totalEarnings: 12340.00,
    totalWithdrawn: 9889.50,
    status: 'active',
    createdAt: '2024-01-01',
  };

  const transactions = [
    {
      id: 'txn_1',
      type: 'credit',
      amount: 450.00,
      description: 'Payment from order ORD-12345',
      date: '2024-01-18 14:30',
      status: 'completed',
    },
    {
      id: 'txn_2',
      type: 'debit',
      amount: 320.00,
      description: 'Withdrawal to bank account',
      date: '2024-01-17 10:15',
      status: 'completed',
    },
    {
      id: 'txn_3',
      type: 'credit',
      amount: 580.00,
      description: 'Payment from order ORD-12344',
      date: '2024-01-16 16:45',
      status: 'completed',
    },
  ];

  const handleFreezeWallet = () => {
    Alert.alert(
      isRTL ? 'تجميد المحفظة' : 'Freeze Wallet',
      isRTL
        ? 'هل أنت متأكد من تجميد هذه المحفظة؟'
        : 'Are you sure you want to freeze this wallet?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'تجميد' : 'Freeze',
          style: 'destructive',
          onPress: () => console.log('Wallet frozen'),
        },
      ]
    );
  };

  const handleUnfreezeWallet = () => {
    Alert.alert(
      isRTL ? 'إلغاء تجميد المحفظة' : 'Unfreeze Wallet',
      isRTL
        ? 'هل أنت متأكد من إلغاء تجميد هذه المحفظة؟'
        : 'Are you sure you want to unfreeze this wallet?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isRTL ? 'إلغاء التجميد' : 'Unfreeze',
          onPress: () => console.log('Wallet unfrozen'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'تفاصيل المحفظة' : 'Wallet Details',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.userCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{walletData.userName.charAt(0)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {walletData.userName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.secondaryText }]}>
              {walletData.email}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  walletData.status === 'active' ? '#10b98120' : '#ef444420',
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: walletData.status === 'active' ? '#10b981' : '#ef4444',
                },
              ]}
            >
              {walletData.status === 'active'
                ? isRTL
                  ? 'نشط'
                  : 'Active'
                : isRTL
                ? 'مجمد'
                : 'Frozen'}
            </Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
            <View style={[styles.balanceIcon, { backgroundColor: '#10b98120' }]}>
              <Wallet size={24} color="#10b981" />
            </View>
            <Text style={[styles.balanceLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'الرصيد المتاح' : 'Available Balance'}
            </Text>
            <Text style={[styles.balanceValue, { color: theme.text }]}>
              {walletData.balance.toFixed(2)} SAR
            </Text>
          </View>

          <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
            <View style={[styles.balanceIcon, { backgroundColor: '#f59e0b20' }]}>
              <Clock size={24} color="#f59e0b" />
            </View>
            <Text style={[styles.balanceLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'قيد الانتظار' : 'Pending'}
            </Text>
            <Text style={[styles.balanceValue, { color: theme.text }]}>
              {walletData.pending.toFixed(2)} SAR
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'الإحصائيات' : 'Statistics'}
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <TrendingUp size={20} color="#10b981" />
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'إجمالي الأرباح' : 'Total Earnings'}
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {walletData.totalEarnings.toFixed(2)} SAR
              </Text>
            </View>
            <View style={styles.statItem}>
              <DollarSign size={20} color="#3b82f6" />
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {isRTL ? 'إجمالي المسحوبات' : 'Total Withdrawn'}
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {walletData.totalWithdrawn.toFixed(2)} SAR
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.transactionsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'آخر المعاملات' : 'Recent Transactions'}
          </Text>
          {transactions.map((txn) => (
            <View key={txn.id} style={styles.transactionItem}>
              <View
                style={[
                  styles.txnIcon,
                  {
                    backgroundColor:
                      txn.type === 'credit' ? '#10b98120' : '#ef444420',
                  },
                ]}
              >
                {txn.type === 'credit' ? (
                  <TrendingUp size={18} color="#10b981" />
                ) : (
                  <DollarSign size={18} color="#ef4444" />
                )}
              </View>
              <View style={styles.txnInfo}>
                <Text style={[styles.txnDescription, { color: theme.text }]}>
                  {txn.description}
                </Text>
                <Text style={[styles.txnDate, { color: theme.secondaryText }]}>
                  {txn.date}
                </Text>
              </View>
              <Text
                style={[
                  styles.txnAmount,
                  {
                    color: txn.type === 'credit' ? '#10b981' : '#ef4444',
                  },
                ]}
              >
                {txn.type === 'credit' ? '+' : '-'}
                {txn.amount.toFixed(2)} SAR
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsSection}>
          {walletData.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={handleFreezeWallet}
              disabled={isProcessing}
            >
              <Lock size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRTL ? 'تجميد المحفظة' : 'Freeze Wallet'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={handleUnfreezeWallet}
              disabled={isProcessing}
            >
              <Unlock size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isRTL ? 'إلغاء تجميد المحفظة' : 'Unfreeze Wallet'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  balanceSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  statsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  transactionsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
  },
  txnDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 4,
  },
  txnDate: {
    fontSize: 12,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
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
