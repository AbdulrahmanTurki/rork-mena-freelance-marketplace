import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Search, Filter, DollarSign, RotateCcw, Lock, Unlock } from 'lucide-react-native';

export default function EscrowLogsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const isRTL = language === 'ar';

  const logs = [
    {
      id: 'log_1',
      type: 'payment_received',
      orderId: 'ORD-12345',
      amount: 450.00,
      user: 'Ahmed Hassan',
      timestamp: '2024-01-18 14:30:25',
      details: 'Payment received from buyer',
    },
    {
      id: 'log_2',
      type: 'funds_released',
      orderId: 'ORD-12344',
      amount: 320.00,
      user: 'Sara Mohamed',
      timestamp: '2024-01-18 13:15:10',
      details: 'Funds released to seller wallet',
    },
    {
      id: 'log_3',
      type: 'refund_processed',
      orderId: 'ORD-12343',
      amount: 580.00,
      user: 'Khaled Ali',
      timestamp: '2024-01-18 12:45:00',
      details: 'Refund processed for cancelled order',
    },
    {
      id: 'log_4',
      type: 'funds_frozen',
      orderId: 'ORD-12342',
      amount: 750.00,
      user: 'Noor Hassan',
      timestamp: '2024-01-18 11:20:35',
      details: 'Funds frozen due to dispute',
    },
    {
      id: 'log_5',
      type: 'funds_unfrozen',
      orderId: 'ORD-12342',
      amount: 750.00,
      user: 'Noor Hassan',
      timestamp: '2024-01-18 16:50:15',
      details: 'Funds unfrozen after dispute resolution',
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return <DollarSign size={20} color="#10b981" />;
      case 'funds_released':
        return <Unlock size={20} color="#3b82f6" />;
      case 'refund_processed':
        return <RotateCcw size={20} color="#f59e0b" />;
      case 'funds_frozen':
        return <Lock size={20} color="#ef4444" />;
      case 'funds_unfrozen':
        return <Unlock size={20} color="#10b981" />;
      default:
        return <FileText size={20} color="#64748b" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'payment_received':
        return '#10b981';
      case 'funds_released':
        return '#3b82f6';
      case 'refund_processed':
        return '#f59e0b';
      case 'funds_frozen':
        return '#ef4444';
      case 'funds_unfrozen':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getLogLabel = (type: string) => {
    switch (type) {
      case 'payment_received':
        return isRTL ? 'دفع مستلم' : 'Payment Received';
      case 'funds_released':
        return isRTL ? 'إطلاق الأموال' : 'Funds Released';
      case 'refund_processed':
        return isRTL ? 'استرداد معالج' : 'Refund Processed';
      case 'funds_frozen':
        return isRTL ? 'أموال مجمدة' : 'Funds Frozen';
      case 'funds_unfrozen':
        return isRTL ? 'أموال غير مجمدة' : 'Funds Unfrozen';
      default:
        return type;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isRTL ? 'سجل الضمان المالي' : 'Escrow Logs',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'البحث بالطلب أو المستخدم...' : 'Search by order or user...'}
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
        {[
          'all',
          'payment_received',
          'funds_released',
          'refund_processed',
          'funds_frozen',
          'funds_unfrozen',
        ].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  typeFilter === type ? theme.primary : theme.card,
              },
            ]}
            onPress={() => setTypeFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: typeFilter === type ? '#fff' : theme.text,
                },
              ]}
            >
              {type === 'all' ? (isRTL ? 'الكل' : 'All') : getLogLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredLogs.map((log) => (
          <View
            key={log.id}
            style={[styles.logCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.logHeader}>
              <View
                style={[
                  styles.logIcon,
                  { backgroundColor: getLogColor(log.type) + '20' },
                ]}
              >
                {getLogIcon(log.type)}
              </View>
              <View style={styles.logInfo}>
                <Text style={[styles.logType, { color: theme.text }]}>
                  {getLogLabel(log.type)}
                </Text>
                <Text style={[styles.logTimestamp, { color: theme.secondaryText }]}>
                  {log.timestamp}
                </Text>
              </View>
              <Text style={[styles.logAmount, { color: theme.text }]}>
                {log.amount.toFixed(2)} SAR
              </Text>
            </View>

            <View style={styles.logDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'رقم الطلب' : 'Order ID'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {log.orderId}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'المستخدم' : 'User'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {log.user}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                  {isRTL ? 'التفاصيل' : 'Details'}
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {log.details}
                </Text>
              </View>
            </View>
          </View>
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
  logCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logType: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
  },
  logAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  logDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 2,
    textAlign: 'right',
  },
});
