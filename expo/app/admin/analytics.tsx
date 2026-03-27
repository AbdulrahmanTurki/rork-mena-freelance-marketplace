import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Briefcase, ShoppingBag, DollarSign, TrendingUp, Star } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { users, gigs, orders } = useAdmin();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const userGrowth = [15, 23, 35, 52, 68, 89];
  const orderVolume = [12, 19, 25, 38, 45, 56];
  const revenue = [2400, 3800, 5200, 7100, 8900, 11200];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'التحليلات' : 'Analytics',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'نمو المستخدمين' : 'User Growth'}
          </Text>
          <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
            <LineChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ data: userGrowth }],
              }}
              width={width - 64}
              height={200}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => theme.secondaryText,
                style: { borderRadius: 16 },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'حجم الطلبات' : 'Order Volume'}
          </Text>
          <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
            <BarChart
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ data: orderVolume }],
              }}
              width={width - 64}
              height={200}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => theme.secondaryText,
              }}
              style={styles.chart}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'أفضل الأداء' : 'Top Performers'}
          </Text>
          <View style={[styles.performerCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.performerTitle, { color: theme.text }]}>
              {isRTL ? 'البائعون الأفضل' : 'Top Sellers'}
            </Text>
            <View style={styles.performerItem}>
              <Text style={[styles.performerRank, { color: theme.primary }]}>#1</Text>
              <Text style={[styles.performerName, { color: theme.text }]}>John Designer</Text>
              <Text style={[styles.performerStat, { color: theme.secondaryText }]}>$12,500</Text>
            </View>
            <View style={styles.performerItem}>
              <Text style={[styles.performerRank, { color: theme.primary }]}>#2</Text>
              <Text style={[styles.performerName, { color: theme.text }]}>Sarah Developer</Text>
              <Text style={[styles.performerStat, { color: theme.secondaryText }]}>$10,200</Text>
            </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginBottom: 16,
    marginTop: 8,
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
  performerCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  performerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  performerRank: {
    fontSize: 18,
    fontWeight: '700' as const,
    width: 40,
  },
  performerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  performerStat: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
