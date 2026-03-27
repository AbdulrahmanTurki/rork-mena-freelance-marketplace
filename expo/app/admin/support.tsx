import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, SupportTicket } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeadphonesIcon, Clock, CheckCircle } from 'lucide-react-native';

export default function SupportTicketsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { supportTickets } = useAdmin();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const TicketCard = ({ ticket }: { ticket: SupportTicket }) => (
    <TouchableOpacity style={[styles.ticketCard, { backgroundColor: theme.card }]}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={[styles.ticketSubject, { color: theme.text }]} numberOfLines={1}>
            {ticket.subject}
          </Text>
          <Text style={[styles.ticketUser, { color: theme.secondaryText }]}>
            {ticket.userName}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
            {ticket.priority}
          </Text>
        </View>
      </View>
      <Text style={[styles.ticketDesc, { color: theme.secondaryText }]} numberOfLines={2}>
        {ticket.description}
      </Text>
      <View style={styles.ticketFooter}>
        <Text style={[styles.ticketDate, { color: theme.tertiaryText }]}>
          {new Date(ticket.createdAt).toLocaleDateString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
            {ticket.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return theme.secondaryText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return theme.secondaryText;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'تذاكر الدعم' : 'Support Tickets',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.statsBar}>
        <View style={[styles.statItem, { backgroundColor: theme.card }]}>
          <Clock size={20} color="#3b82f6" />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {supportTickets.filter(t => t.status === 'open').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Open</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: theme.card }]}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {supportTickets.filter(t => t.status === 'resolved').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Resolved</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {supportTickets.map(ticket => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  ticketUser: {
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  ticketDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  ticketDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
});
