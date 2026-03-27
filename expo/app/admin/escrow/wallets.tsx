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
import { Wallet, Search, ChevronRight, DollarSign, TrendingUp } from 'lucide-react-native';

export default function EscrowWalletsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = language === 'ar';

  const wallets = [
    {
      id: 'wallet_1',
      userId: 'user_123',
      userName: 'Ahmed Hassan',
      balance: 2450.50,
      pending: 500.00,
      totalEarnings: 12340.00,
      status: 'active',
    },
    {
      id: 'wallet_2',
      userId: 'user_456',
      userName: 'Sara Mohamed',
      balance: 1890.00,
      pending: 300.00,
      totalEarnings: 8950.00,
      status: 'active',
    },
    {
      id: 'wallet_3',
      userId: 'user_789',
      userName: 'Khaled Ali',
      balance: 0.00,
      pending: 0.00,
      totalEarnings: 450.00,
      status: 'frozen',
    },
  ];

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.userId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'المحافظ' : 'Wallets',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'البحث عن مستخدم...' : 'Search by user...'}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <View style={[styles.statIcon, { backgroundColor: '#10b98120' }]}>
            <Wallet size={22} color="#10b981" />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>{wallets.length}</Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            {isRTL ? 'إجمالي المحافظ' : 'Total Wallets'}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <View style={[styles.statIcon, { backgroundColor: '#3b82f620' }]}>
            <TrendingUp size={22} color="#3b82f6" />
          </View>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {wallets.filter((w) => w.status === 'active').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
            {isRTL ? 'نشط' : 'Active'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredWallets.map((wallet) => (
          <TouchableOpacity
            key={wallet.id}
            style={[styles.walletCard, { backgroundColor: theme.card }]}
            onPress={() => router.push(`/admin/wallet/${wallet.userId}` as any)}
          >
            <View style={styles.walletHeader}>
              <View>
                <Text style={[styles.userName, { color: theme.text }]}>
                  {wallet.userName}
                </Text>
                <Text style={[styles.userId, { color: theme.secondaryText }]}>
                  {wallet.userId}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      wallet.status === 'active' ? '#10b98120' : '#ef444420',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: wallet.status === 'active' ? '#10b981' : '#ef4444',
                    },
                  ]}
                >
                  {wallet.status === 'active'
                    ? isRTL
                      ? 'نشط'
                      : 'Active'
                    : isRTL
                    ? 'مجمد'
                    : 'Frozen'}
                </Text>
              </View>
            </View>

            <View style={styles.walletDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'الرصيد' : 'Balance'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {wallet.balance.toFixed(2)} SAR
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {wallet.pending.toFixed(2)} SAR
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'إجمالي الأرباح' : 'Total Earnings'}
                </Text>
                <Text style={[styles.detailValue, { color: '#10b981' }]}>
                  {wallet.totalEarnings.toFixed(2)} SAR
                </Text>
              </View>
            </View>

            <View style={styles.walletFooter}>
              <Text style={[styles.viewDetails, { color: theme.primary }]}>
                {isRTL ? 'عرض التفاصيل' : 'View Details'}
              </Text>
              <ChevronRight size={18} color={theme.primary} />
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  walletCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
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
  walletDetails: {
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
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  walletFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
