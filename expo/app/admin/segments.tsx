import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Users, Star, TrendingUp, AlertTriangle } from 'lucide-react-native';

type UserSegment = {
  id: string;
  name: string;
  description: string;
  count: number;
  color: string;
  icon: typeof Users;
};

export default function UserSegmentsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [segments] = useState<UserSegment[]>([
    {
      id: '1',
      name: isRTL ? 'مستخدمون نشطون' : 'Active Users',
      description: isRTL ? 'مستخدمون نشطون في آخر 7 أيام' : 'Users active in last 7 days',
      count: 12453,
      color: '#10b981',
      icon: Users,
    },
    {
      id: '2',
      name: isRTL ? 'أفضل البائعين' : 'Top Sellers',
      description: isRTL ? 'بائعون بتقييم أعلى من 4.5' : 'Sellers with rating above 4.5',
      count: 342,
      color: '#f59e0b',
      icon: Star,
    },
    {
      id: '3',
      name: isRTL ? 'مشترون متكررون' : 'Repeat Buyers',
      description: isRTL ? 'قاموا بأكثر من 3 طلبات' : 'Made more than 3 orders',
      count: 1876,
      color: '#3b82f6',
      icon: TrendingUp,
    },
    {
      id: '4',
      name: isRTL ? 'معرضون للمخاطر' : 'At Risk',
      description: isRTL ? 'لم يسجلوا دخول منذ 30 يوم' : 'Not logged in for 30+ days',
      count: 523,
      color: '#ef4444',
      icon: AlertTriangle,
    },
  ]);

  const filteredSegments = segments.filter(seg =>
    seg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SegmentCard = ({ segment }: { segment: UserSegment }) => {
    const Icon = segment.icon;

    return (
      <TouchableOpacity style={[styles.segmentCard, { backgroundColor: theme.card }]}>
        <View style={[styles.segmentIcon, { backgroundColor: segment.color + '20' }]}>
          <Icon size={28} color={segment.color} />
        </View>
        <View style={styles.segmentInfo}>
          <Text style={[styles.segmentName, { color: theme.text }]}>
            {segment.name}
          </Text>
          <Text style={[styles.segmentDesc, { color: theme.secondaryText }]}>
            {segment.description}
          </Text>
          <Text style={[styles.segmentCount, { color: segment.color }]}>
            {segment.count.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}
          </Text>
        </View>
      </TouchableOpacity>
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
            {isRTL ? 'شرائح المستخدمين' : 'User Segments & Search'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'البحث عن الشرائح...' : 'Search segments...'}
            placeholderTextColor={theme.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>
            {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
          </Text>
          <Text style={[styles.statsValue, { color: theme.primary }]}>
            {segments.reduce((sum, s) => sum + s.count, 0).toLocaleString()}
          </Text>
        </View>

        {filteredSegments.map((segment) => (
          <SegmentCard key={segment.id} segment={segment} />
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
    marginBottom: 16,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: '700' as const,
  },
  segmentCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  segmentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  segmentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  segmentName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  segmentDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  segmentCount: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
