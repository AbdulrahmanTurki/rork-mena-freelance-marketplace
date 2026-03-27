import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users,
  Briefcase,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserCheck,
  Clock,
  CheckCircle,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { users, gigs, orders, disputes, payoutRequests, adminUser } = useAdmin();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingUsers: users.filter(u => u.status === 'pending').length,
    totalGigs: gigs.length,
    activeGigs: gigs.filter(g => g.status === 'active').length,
    pendingGigs: gigs.filter(g => g.status === 'pending_approval').length,
    totalOrders: orders.length,
    activeOrders: orders.filter(o => o.status === 'active').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0),
    openDisputes: disputes.filter(d => d.status === 'open' || d.status === 'investigating').length,
    pendingPayouts: payoutRequests.filter(p => p.status === 'pending').length,
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: theme.secondaryText }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: theme.tertiaryText }]}>{subtitle}</Text>
      )}
    </View>
  );

  const QuickActionButton = ({ title, icon: Icon, onPress, color }: any) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: theme.card }]}
      onPress={onPress}
    >
      <Icon size={20} color={color} />
      <Text style={[styles.quickActionText, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBackground, paddingTop: insets.top + 16 },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isRTL ? 'لوحة التحكم' : 'Admin Dashboard'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
          {isRTL ? `مرحباً، ${adminUser?.name}` : `Welcome, ${adminUser?.name}`}
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
              value={stats.totalUsers}
              icon={Users}
              color="#3b82f6"
              subtitle={`${stats.activeUsers} ${isRTL ? 'نشط' : 'active'}`}
            />
            <StatCard
              title={isRTL ? 'الخدمات النشطة' : 'Active Gigs'}
              value={stats.activeGigs}
              icon={Briefcase}
              color="#10b981"
              subtitle={`${stats.totalGigs} ${isRTL ? 'إجمالي' : 'total'}`}
            />
            <StatCard
              title={isRTL ? 'الطلبات' : 'Orders'}
              value={stats.totalOrders}
              icon={ShoppingBag}
              color="#f59e0b"
              subtitle={`${stats.completedOrders} ${isRTL ? 'مكتمل' : 'completed'}`}
            />
            <StatCard
              title={isRTL ? 'الإيرادات' : 'Revenue'}
              value={`${stats.totalRevenue.toLocaleString()} ${isRTL ? 'ريال' : 'SAR'}`}
              icon={DollarSign}
              color="#8b5cf6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'يحتاج إلى انتباه' : 'Needs Attention'}
          </Text>
          <View style={styles.alertsGrid}>
            <TouchableOpacity
              style={[styles.alertCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/admin/(tabs)/disputes')}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: '#ef444420' }]}>
                <AlertCircle size={24} color="#ef4444" />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertValue, { color: theme.text }]}>
                  {stats.openDisputes}
                </Text>
                <Text style={[styles.alertTitle, { color: theme.secondaryText }]}>
                  {isRTL ? 'نزاعات مفتوحة' : 'Open Disputes'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/admin/(tabs)/users')}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: '#f59e0b20' }]}>
                <UserCheck size={24} color="#f59e0b" />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertValue, { color: theme.text }]}>
                  {stats.pendingUsers}
                </Text>
                <Text style={[styles.alertTitle, { color: theme.secondaryText }]}>
                  {isRTL ? 'بائعون بانتظار الموافقة' : 'Pending Sellers'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/admin/(tabs)/gigs')}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: '#f59e0b20' }]}>
                <Clock size={24} color="#f59e0b" />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertValue, { color: theme.text }]}>
                  {stats.pendingGigs}
                </Text>
                <Text style={[styles.alertTitle, { color: theme.secondaryText }]}>
                  {isRTL ? 'خدمات بانتظار الموافقة' : 'Pending Gigs'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.alertCard, { backgroundColor: theme.card }]}
              onPress={() => router.push('/admin/payments')}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: '#10b98120' }]}>
                <DollarSign size={24} color="#10b981" />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertValue, { color: theme.text }]}>
                  {stats.pendingPayouts}
                </Text>
                <Text style={[styles.alertTitle, { color: theme.secondaryText }]}>
                  {isRTL ? 'طلبات سحب معلقة' : 'Pending Payouts'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              title={isRTL ? 'مراجعة البائعين' : 'Review Sellers'}
              icon={UserCheck}
              color="#3b82f6"
              onPress={() => router.push('/admin/(tabs)/users')}
            />
            <QuickActionButton
              title={isRTL ? 'الموافقة على الخدمات' : 'Approve Gigs'}
              icon={CheckCircle}
              color="#10b981"
              onPress={() => router.push('/admin/(tabs)/gigs')}
            />
            <QuickActionButton
              title={isRTL ? 'حل النزاعات' : 'Resolve Disputes'}
              icon={AlertCircle}
              color="#ef4444"
              onPress={() => router.push('/admin/(tabs)/disputes')}
            />
            <QuickActionButton
              title={isRTL ? 'موافقة السحوبات' : 'Approve Payouts'}
              icon={DollarSign}
              color="#8b5cf6"
              onPress={() => router.push('/admin/payments')}
            />
          </View>
        </View>
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: (width - 52) / 2,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  alertsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  alertCard: {
    width: (width - 52) / 2,
    margin: 6,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAction: {
    width: (width - 52) / 2,
    margin: 6,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginLeft: 8,
    flex: 1,
  },
});
