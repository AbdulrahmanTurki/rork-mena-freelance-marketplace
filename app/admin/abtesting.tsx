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
import { ArrowLeft, Plus } from 'lucide-react-native';

type ABTest = {
  id: string;
  name: string;
  description: string;
  variantA: string;
  variantB: string;
  traffic: number;
  status: 'active' | 'draft' | 'completed';
  conversions: { a: number; b: number };
};

export default function ABTestingScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [tests, setTests] = useState<ABTest[]>([
    {
      id: '1',
      name: isRTL ? 'تصميم زر الطلب' : 'Order Button Design',
      description: isRTL ? 'اختبار لونين مختلفين للزر' : 'Test two different button colors',
      variantA: 'Blue Button',
      variantB: 'Green Button',
      traffic: 50,
      status: 'active',
      conversions: { a: 120, b: 145 },
    },
    {
      id: '2',
      name: isRTL ? 'نص الصفحة الرئيسية' : 'Homepage Copy',
      description: isRTL ? 'اختبار عنوانين رئيسيين' : 'Test two headlines',
      variantA: 'Find Your Expert',
      variantB: 'Hire Top Freelancers',
      traffic: 50,
      status: 'active',
      conversions: { a: 85, b: 92 },
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const TestCard = ({ test }: { test: ABTest }) => {
    const totalConversions = test.conversions.a + test.conversions.b;
    const conversionRateA = totalConversions > 0 ? (test.conversions.a / totalConversions * 100).toFixed(1) : '0';
    const conversionRateB = totalConversions > 0 ? (test.conversions.b / totalConversions * 100).toFixed(1) : '0';

    return (
      <View style={[styles.testCard, { backgroundColor: theme.card }]}>
        <View style={styles.testHeader}>
          <View style={styles.testInfo}>
            <Text style={[styles.testName, { color: theme.text }]}>
              {test.name}
            </Text>
            <Text style={[styles.testDesc, { color: theme.secondaryText }]}>
              {test.description}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: test.status === 'active' ? '#10b98120' : '#f59e0b20' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: test.status === 'active' ? '#10b981' : '#f59e0b' }
            ]}>
              {test.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'مسودة' : 'Draft')}
            </Text>
          </View>
        </View>

        <View style={styles.variantsContainer}>
          <View style={[styles.variantBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.variantLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'النسخة أ' : 'Variant A'}
            </Text>
            <Text style={[styles.variantText, { color: theme.text }]}>
              {test.variantA}
            </Text>
            <Text style={[styles.conversionRate, { color: '#3b82f6' }]}>
              {conversionRateA}% {isRTL ? 'تحويل' : 'conversion'}
            </Text>
          </View>

          <View style={[styles.variantBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.variantLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'النسخة ب' : 'Variant B'}
            </Text>
            <Text style={[styles.variantText, { color: theme.text }]}>
              {test.variantB}
            </Text>
            <Text style={[styles.conversionRate, { color: '#10b981' }]}>
              {conversionRateB}% {isRTL ? 'تحويل' : 'conversion'}
            </Text>
          </View>
        </View>

        <View style={styles.trafficInfo}>
          <Text style={[styles.trafficLabel, { color: theme.secondaryText }]}>
            {isRTL ? 'نسبة الزيارات' : 'Traffic Split'}
          </Text>
          <Text style={[styles.trafficValue, { color: theme.text }]}>
            50/50
          </Text>
        </View>
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
            {isRTL ? 'اختبارات A/B' : 'A/B Testing'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {tests.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
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
  testCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  testDesc: {
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
  variantsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  variantBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  variantLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  variantText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  conversionRate: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  trafficInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trafficLabel: {
    fontSize: 14,
  },
  trafficValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
