import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ShoppingBag,
  DollarSign,
  Bell,
  HeadphonesIcon,
  Settings,
  LogOut,
  TrendingUp,
  FileText,
  Activity,
  Shield,
  Folder,
  Percent,
  Zap,
  AlertTriangle,
  Mail,
  Sliders,
  Server,
  TestTube,
  Globe,
  Users,
} from 'lucide-react-native';

export default function AdminMoreScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { logoutAdmin, adminUser } = useAdmin();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const menuItems = [
    {
      icon: DollarSign,
      title: isRTL ? 'إدارة الضمان المالي' : 'Escrow Management',
      subtitle: isRTL ? 'إدارة المدفوعات والسحوبات' : 'Manage escrow and payments',
      color: '#10b981',
      route: '/admin/escrow',
    },
    {
      icon: Shield,
      title: isRTL ? 'طلبات التحقق' : 'Verification Requests',
      subtitle: isRTL ? 'مراجعة طلبات التحقق من البائعين' : 'Review seller verification requests',
      color: '#8b5cf6',
      route: '/admin/verifications',
    },
    {
      icon: ShoppingBag,
      title: isRTL ? 'مراقبة الطلبات' : 'Order Monitoring',
      subtitle: isRTL ? 'عرض جميع الطلبات وإدارتها' : 'View and manage all orders',
      color: '#3b82f6',
      route: '/admin/orders',
    },
    {
      icon: DollarSign,
      title: isRTL ? 'المدفوعات والإيرادات' : 'Payments & Revenue',
      subtitle: isRTL ? 'إدارة الدفعات والسحوبات' : 'Manage payouts and withdrawals',
      color: '#10b981',
      route: '/admin/payments',
    },
    {
      icon: TrendingUp,
      title: isRTL ? 'التحليلات' : 'Analytics',
      subtitle: isRTL ? 'عرض الإحصائيات والتقارير' : 'View statistics and reports',
      color: '#8b5cf6',
      route: '/admin/analytics',
    },
    {
      icon: Settings,
      title: isRTL ? 'إدارة الأدوار' : 'Role Management',
      subtitle: isRTL ? 'إدارة الصلاحيات والأدوار' : 'Manage permissions and roles',
      color: '#ef4444',
      route: '/admin/roles',
    },
    {
      icon: Folder,
      title: isRTL ? 'التصنيفات والوسوم' : 'Categories & Tags',
      subtitle: isRTL ? 'إدارة تصنيفات الخدمات' : 'Manage service categories',
      color: '#ec4899',
      route: '/admin/categories',
    },
    {
      icon: Percent,
      title: isRTL ? 'الرسوم والعمولات' : 'Fees & Commissions',
      subtitle: isRTL ? 'إدارة رسوم المنصة' : 'Manage platform fees',
      color: '#10b981',
      route: '/admin/fees',
    },
    {
      icon: Zap,
      title: isRTL ? 'الترويج والإعلانات' : 'Promotions',
      subtitle: isRTL ? 'إدارة الخدمات المميزة' : 'Manage featured listings',
      color: '#f59e0b',
      route: '/admin/promotions',
    },
    {
      icon: AlertTriangle,
      title: isRTL ? 'القواعد التلقائية' : 'Automated Rules',
      subtitle: isRTL ? 'كشف الاحتيال والسلوك المسيء' : 'Fraud & spam detection',
      color: '#ef4444',
      route: '/admin/rules',
    },
    {
      icon: Activity,
      title: isRTL ? 'سجل التدقيق' : 'Audit Logs',
      subtitle: isRTL ? 'سجل إجراءات المشرفين' : 'Admin action history',
      color: '#6366f1',
      route: '/admin/audit',
    },
    {
      icon: Mail,
      title: isRTL ? 'قوالب الرسائل' : 'Message Templates',
      subtitle: isRTL ? 'قوالب البريد والرسائل' : 'Email & SMS templates',
      color: '#3b82f6',
      route: '/admin/templates',
    },
    {
      icon: Sliders,
      title: isRTL ? 'إعدادات التطبيق' : 'App Configuration',
      subtitle: isRTL ? 'إعدادات عامة للمنصة' : 'Platform settings',
      color: '#64748b',
      route: '/admin/config',
    },
    {
      icon: Server,
      title: isRTL ? 'مراقبة الأداء' : 'Performance',
      subtitle: isRTL ? 'مراقبة صحة النظام' : 'System health monitoring',
      color: '#10b981',
      route: '/admin/performance',
    },
    {
      icon: TestTube,
      title: isRTL ? 'اختبارات A/B' : 'A/B Testing',
      subtitle: isRTL ? 'تجربة التصاميم والميزات' : 'Test features & designs',
      color: '#8b5cf6',
      route: '/admin/abtesting',
    },
    {
      icon: Globe,
      title: isRTL ? 'التحكم بالترجمات' : 'Localization',
      subtitle: isRTL ? 'إدارة الترجمات' : 'Manage translations',
      color: '#06b6d4',
      route: '/admin/localization',
    },
    {
      icon: Users,
      title: isRTL ? 'شرائح المستخدمين' : 'User Segments',
      subtitle: isRTL ? 'البحث والتحليل' : 'Search & analysis',
      color: '#f59e0b',
      route: '/admin/segments',
    },
    {
      icon: Bell,
      title: isRTL ? 'الإشعارات' : 'Notifications',
      subtitle: isRTL ? 'إرسال إشعارات النظام' : 'Send system notifications',
      color: '#f59e0b',
      route: '/admin/notifications',
    },
    {
      icon: HeadphonesIcon,
      title: isRTL ? 'تذاكر الدعم' : 'Support Tickets',
      subtitle: isRTL ? 'إدارة طلبات الدعم' : 'Manage support requests',
      color: '#ec4899',
      route: '/admin/support',
    },
    {
      icon: FileText,
      title: isRTL ? 'إدارة المحتوى' : 'Content Management',
      subtitle: isRTL ? 'تحرير الصفحات والمحتوى' : 'Edit pages and content',
      color: '#06b6d4',
      route: '/admin/content',
    },
    {
      icon: Settings,
      title: isRTL ? 'الإعدادات' : 'Settings',
      subtitle: isRTL ? 'إعدادات عامة' : 'General settings',
      color: '#64748b',
      route: '/admin/settings',
    },
  ];

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  };

  const MenuItem = ({ item }: { item: typeof menuItems[0] }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.card }]}
      onPress={() => router.push(item.route as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <item.icon size={24} color={item.color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.menuSubtitle, { color: theme.secondaryText }]}>
          {item.subtitle}
        </Text>
      </View>
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
          {isRTL ? 'المزيد' : 'More'}
        </Text>
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {adminUser?.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {adminUser?.name}
            </Text>
            <Text style={[styles.profileRole, { color: theme.secondaryText }]}>
              {adminUser?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.card }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>{isRTL ? 'تسجيل الخروج' : 'Logout'}</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ef4444',
  },
});
