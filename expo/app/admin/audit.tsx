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
import { ArrowLeft, Search, UserX, Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';

type AuditLog = {
  id: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'gig' | 'order' | 'dispute';
  targetId: string;
  details: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
};

export default function AuditLogsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [logs] = useState<AuditLog[]>([
    {
      id: '1',
      adminName: 'Super Admin',
      action: 'User Suspended',
      targetType: 'user',
      targetId: 'U12345',
      details: 'Suspended user for violating terms of service',
      timestamp: '2025-01-08 14:30:00',
      severity: 'high',
    },
    {
      id: '2',
      adminName: 'Content Moderator',
      action: 'Gig Approved',
      targetType: 'gig',
      targetId: 'G5678',
      details: 'Approved gig after review',
      timestamp: '2025-01-08 13:15:00',
      severity: 'low',
    },
    {
      id: '3',
      adminName: 'Finance Admin',
      action: 'Withdrawal Approved',
      targetType: 'order',
      targetId: 'W9012',
      details: 'Approved withdrawal request of $500',
      timestamp: '2025-01-08 12:00:00',
      severity: 'medium',
    },
    {
      id: '4',
      adminName: 'Support Agent',
      action: 'Dispute Resolved',
      targetType: 'dispute',
      targetId: 'D3456',
      details: 'Resolved dispute in favor of buyer with refund',
      timestamp: '2025-01-08 11:45:00',
      severity: 'high',
    },
    {
      id: '5',
      adminName: 'Super Admin',
      action: 'User Banned',
      targetType: 'user',
      targetId: 'U78901',
      details: 'Permanently banned user for fraudulent activity',
      timestamp: '2025-01-08 10:20:00',
      severity: 'critical',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#10b981';
      case 'medium': return '#3b82f6';
      case 'high': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return CheckCircle;
      case 'medium': return Shield;
      case 'high': return AlertTriangle;
      case 'critical': return UserX;
      default: return Shield;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const LogCard = ({ log }: { log: AuditLog }) => {
    const Icon = getSeverityIcon(log.severity);
    const color = getSeverityColor(log.severity);

    return (
      <View style={[styles.logCard, { backgroundColor: theme.card }]}>
        <View style={styles.logHeader}>
          <View style={[styles.severityIcon, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.logInfo}>
            <Text style={[styles.actionText, { color: theme.text }]}>
              {log.action}
            </Text>
            <Text style={[styles.adminText, { color: theme.secondaryText }]}>
              {isRTL ? 'بواسطة' : 'by'} {log.adminName}
            </Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.severityText, { color }]}>
              {log.severity}
            </Text>
          </View>
        </View>

        <Text style={[styles.detailsText, { color: theme.secondaryText }]}>
          {log.details}
        </Text>

        <View style={styles.logFooter}>
          <View style={styles.targetInfo}>
            <Text style={[styles.targetType, { color: theme.secondaryText }]}>
              {log.targetType.toUpperCase()}
            </Text>
            <Text style={[styles.targetId, { color: theme.text }]}>
              #{log.targetId}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: theme.secondaryText }]}>
            {log.timestamp}
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
            {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'البحث في السجلات...' : 'Search logs...'}
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
        {filteredLogs.map((log) => (
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
  logCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  adminText: {
    fontSize: 13,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetType: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  targetId: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  timestamp: {
    fontSize: 12,
  },
});
