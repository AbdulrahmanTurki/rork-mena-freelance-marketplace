import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Activity, Zap, Server, Database, Cpu, HardDrive } from 'lucide-react-native';

type PerformanceMetric = {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  icon: typeof Activity;
};

export default function PerformanceScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [metrics] = useState<PerformanceMetric[]>([
    {
      name: isRTL ? 'وقت التشغيل' : 'Uptime',
      value: '99.9%',
      status: 'good',
      icon: Activity,
    },
    {
      name: isRTL ? 'وقت الاستجابة' : 'Response Time',
      value: '120ms',
      status: 'good',
      icon: Zap,
    },
    {
      name: isRTL ? 'استخدام المعالج' : 'CPU Usage',
      value: '45%',
      status: 'good',
      icon: Cpu,
    },
    {
      name: isRTL ? 'استخدام الذاكرة' : 'Memory Usage',
      value: '72%',
      status: 'warning',
      icon: HardDrive,
    },
    {
      name: isRTL ? 'قاعدة البيانات' : 'Database',
      value: 'Healthy',
      status: 'good',
      icon: Database,
    },
    {
      name: isRTL ? 'حالة الخادم' : 'Server Status',
      value: 'Online',
      status: 'good',
      icon: Server,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  const MetricCard = ({ metric }: { metric: PerformanceMetric }) => {
    const color = getStatusColor(metric.status);
    const Icon = metric.icon;

    return (
      <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={[styles.metricName, { color: theme.secondaryText }]}>
            {metric.name}
          </Text>
          <Text style={[styles.metricValue, { color: theme.text }]}>
            {metric.value}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
      </View>
    );
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
            {isRTL ? 'مراقبة الأداء' : 'Performance Monitoring'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statusCard, { backgroundColor: '#d1fae5' }]}>
          <Activity size={24} color="#10b981" />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: '#065f46' }]}>
              {isRTL ? 'النظام يعمل بشكل طبيعي' : 'All Systems Operational'}
            </Text>
            <Text style={[styles.statusDesc, { color: '#047857' }]}>
              {isRTL ? 'آخر تحديث: منذ دقيقة' : 'Last updated: 1 minute ago'}
            </Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </View>

        <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'سجل الأخطاء الأخيرة' : 'Recent Error Logs'}
          </Text>
          <Text style={[styles.noErrors, { color: theme.secondaryText }]}>
            {isRTL ? 'لا توجد أخطاء في آخر 24 ساعة' : 'No errors in the last 24 hours'}
          </Text>
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
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 13,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 14,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  noErrors: {
    fontSize: 14,
    textAlign: 'center',
  },
});
