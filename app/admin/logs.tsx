import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, ActivityLog } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react-native';

export default function ActivityLogsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { activityLogs } = useAdmin();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const getActionIcon = (action: string) => {
    if (action.includes('approve')) return CheckCircle;
    if (action.includes('reject')) return XCircle;
    if (action.includes('suspend')) return AlertCircle;
    if (action.includes('verify')) return Shield;
    return Activity;
  };

  const getActionColor = (action: string) => {
    if (action.includes('approve')) return '#10b981';
    if (action.includes('reject')) return '#ef4444';
    if (action.includes('suspend')) return '#f59e0b';
    if (action.includes('verify')) return '#3b82f6';
    return theme.primary;
  };

  const LogCard = ({ log }: { log: ActivityLog }) => {
    const Icon = getActionIcon(log.action);
    const color = getActionColor(log.action);

    return (
      <View style={[styles.logCard, { backgroundColor: theme.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Icon size={20} color={color} />
        </View>
        <View style={styles.logContent}>
          <Text style={[styles.logAction, { color: theme.text }]}>
            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Text>
          <Text style={[styles.logDetails, { color: theme.secondaryText }]}>
            {log.details}
          </Text>
          <Text style={[styles.logMeta, { color: theme.tertiaryText }]}>
            {log.adminName} • {new Date(log.timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'سجل النشاطات' : 'Activity Logs',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <Text style={[styles.header, { color: theme.text }]}>
          {isRTL ? 'سجل أعمال الإشراف' : 'Moderation History'}
        </Text>
        {activityLogs.map(log => (
          <LogCard key={log.id} log={log} />
        ))}
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
  },
  header: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginVertical: 16,
  },
  logCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  logMeta: {
    fontSize: 12,
  },
});
