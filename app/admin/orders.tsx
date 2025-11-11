import { useState } from 'react';
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
import { useAdmin, Order } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from 'lucide-react-native';

export default function OrderMonitoringScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { orders } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed'>('all');

  const isRTL = language === 'ar';

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#6b7280';
      case 'disputed':
        return '#ef4444';
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'active':
          return 'نشط';
        case 'pending':
          return 'معلق';
        case 'completed':
          return 'مكتمل';
        case 'cancelled':
          return 'ملغي';
        case 'disputed':
          return 'متنازع عليه';
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <TouchableOpacity style={[styles.orderCard, { backgroundColor: theme.card }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={1}>
            {order.gigTitle}
          </Text>
          <Text style={[styles.orderParties, { color: theme.secondaryText }]}>
            {order.buyerName} → {order.sellerName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={[styles.amount, { color: theme.primary }]}>{order.amount} {isRTL ? 'ريال' : 'SAR'}</Text>
        <Text style={[styles.date, { color: theme.tertiaryText }]}>
          {new Date(order.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const stats = {
    total: orders.length,
    active: orders.filter(o => o.status === 'active').length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    disputed: orders.filter(o => o.status === 'disputed').length,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'مراقبة الطلبات' : 'Order Monitoring',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.header}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Package size={20} color="#3b82f6" />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'إجمالي' : 'Total'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Clock size={20} color="#f59e0b" />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'نشط' : 'Active'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <CheckCircle size={20} color="#10b981" />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'مكتمل' : 'Done'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.disputed}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'نزاع' : 'Disputed'}
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
            {['all', 'active', 'pending', 'completed', 'disputed'].map(status => (
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredOrders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
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
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
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
  gigTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  orderParties: {
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
  orderFooter: {
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
});
