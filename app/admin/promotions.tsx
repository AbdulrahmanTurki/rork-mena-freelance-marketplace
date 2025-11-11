import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Zap, TrendingUp, Star, Award } from 'lucide-react-native';

type Promotion = {
  id: string;
  gigId: string;
  gigTitle: string;
  sellerName: string;
  type: 'featured' | 'boosted' | 'premium';
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
  views: number;
  clicks: number;
  amount: number;
};

export default function PromotionsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      gigId: 'g1',
      gigTitle: 'Professional Logo Design',
      sellerName: 'Ahmed Hassan',
      type: 'featured',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      status: 'active',
      views: 12450,
      clicks: 890,
      amount: 50,
    },
    {
      id: '2',
      gigId: 'g2',
      gigTitle: 'Social Media Marketing',
      sellerName: 'Sarah Ali',
      type: 'boosted',
      startDate: '2025-01-08',
      endDate: '2025-01-15',
      status: 'pending',
      views: 0,
      clicks: 0,
      amount: 20,
    },
    {
      id: '3',
      gigId: 'g3',
      gigTitle: 'Web Development Services',
      sellerName: 'Mohammed Saleh',
      type: 'premium',
      startDate: '2024-12-15',
      endDate: '2025-01-15',
      status: 'active',
      views: 23680,
      clicks: 1450,
      amount: 100,
    },
    {
      id: '4',
      gigId: 'g4',
      gigTitle: 'Content Writing',
      sellerName: 'Fatima Omar',
      type: 'featured',
      startDate: '2024-12-20',
      endDate: '2025-01-07',
      status: 'expired',
      views: 8920,
      clicks: 520,
      amount: 50,
    },
  ]);

  const [autoApprove, setAutoApprove] = useState(false);

  const handleApprove = (id: string) => {
    setPromotions(promotions.map(p => 
      p.id === id ? { ...p, status: 'active' as const } : p
    ));
  };

  const handleReject = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'featured': return '#f59e0b';
      case 'boosted': return '#3b82f6';
      case 'premium': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'featured': return Star;
      case 'boosted': return TrendingUp;
      case 'premium': return Award;
      default: return Zap;
    }
  };

  const PromotionCard = ({ promo }: { promo: Promotion }) => {
    const TypeIcon = getTypeIcon(promo.type);
    const color = getTypeColor(promo.type);

    return (
      <View style={[styles.promoCard, { backgroundColor: theme.card }]}>
        <View style={styles.promoHeader}>
          <View style={[styles.typeIcon, { backgroundColor: color + '20' }]}>
            <TypeIcon size={20} color={color} />
          </View>
          <View style={styles.promoInfo}>
            <Text style={[styles.gigTitle, { color: theme.text }]}>
              {promo.gigTitle}
            </Text>
            <Text style={[styles.sellerName, { color: theme.secondaryText }]}>
              {promo.sellerName}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: promo.status === 'active' ? '#10b98120' : promo.status === 'pending' ? '#f59e0b20' : '#ef444420' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: promo.status === 'active' ? '#10b981' : promo.status === 'pending' ? '#f59e0b' : '#ef4444' }
            ]}>
              {promo.status === 'active' ? (isRTL ? 'نشط' : 'Active') : 
               promo.status === 'pending' ? (isRTL ? 'معلق' : 'Pending') : 
               (isRTL ? 'منتهي' : 'Expired')}
            </Text>
          </View>
        </View>

        <View style={styles.promoDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'النوع' : 'Type'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {promo.type.charAt(0).toUpperCase() + promo.type.slice(1)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'المبلغ' : 'Amount'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              ${promo.amount}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'المشاهدات' : 'Views'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {promo.views.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'النقرات' : 'Clicks'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {promo.clicks.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.promoDate}>
          <Text style={[styles.dateText, { color: theme.secondaryText }]}>
            {promo.startDate} → {promo.endDate}
          </Text>
        </View>

        {promo.status === 'pending' && (
          <View style={styles.promoActions}>
            <TouchableOpacity
              style={[styles.approveButton, { backgroundColor: '#10b98120' }]}
              onPress={() => handleApprove(promo.id)}
            >
              <Text style={[styles.approveText, { color: '#10b981' }]}>
                {isRTL ? 'موافقة' : 'Approve'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: '#ef444420' }]}
              onPress={() => handleReject(promo.id)}
            >
              <Text style={[styles.rejectText, { color: '#ef4444' }]}>
                {isRTL ? 'رفض' : 'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const stats = {
    totalRevenue: promotions.reduce((sum, p) => sum + p.amount, 0),
    activePromos: promotions.filter(p => p.status === 'active').length,
    pendingApproval: promotions.filter(p => p.status === 'pending').length,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBackground, paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isRTL ? 'الترويج والخدمات المميزة' : 'Promotions & Featured Listings'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>
              ${stats.totalRevenue}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {stats.activePromos}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'ترويجات نشطة' : 'Active Promos'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>
              {stats.pendingApproval}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'في الانتظار' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={[styles.settingCard, { backgroundColor: theme.card }]}>
          <View style={styles.settingContent}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                {isRTL ? 'موافقة تلقائية' : 'Auto-Approve'}
              </Text>
              <Text style={[styles.settingDesc, { color: theme.secondaryText }]}>
                {isRTL ? 'الموافقة التلقائية على طلبات الترويج' : 'Automatically approve promotion requests'}
              </Text>
            </View>
            <Switch
              value={autoApprove}
              onValueChange={setAutoApprove}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {promotions.map((promo) => (
          <PromotionCard key={promo.id} promo={promo} />
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
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
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
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
  },
  promoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  promoInfo: {
    flex: 1,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sellerName: {
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
  promoDetails: {
    gap: 8,
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600' as const,
  },
  promoDate: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  approveText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  rejectButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
