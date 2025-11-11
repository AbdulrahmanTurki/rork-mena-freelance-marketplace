import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, Dispute } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  DollarSign,
  AlertTriangle,
} from 'lucide-react-native';

export default function DisputesManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { disputes, resolveDispute } = useAdmin();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'closed'>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

  const isRTL = language === 'ar';

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch =
      dispute.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reportedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#ef4444';
      case 'investigating':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'open':
          return 'مفتوح';
        case 'investigating':
          return 'قيد التحقيق';
        case 'resolved':
          return 'محلول';
        case 'closed':
          return 'مغلق';
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleResolve = async (outcome: string) => {
    if (selectedDispute) {
      const refund = refundAmount ? parseFloat(refundAmount) : undefined;
      await resolveDispute(selectedDispute.id, outcome, refund);
      setShowDisputeModal(false);
      setSelectedDispute(null);
      setResolution('');
      setRefundAmount('');
      setAdminMessage('');
    }
  };

  const DisputeCard = ({ dispute }: { dispute: Dispute }) => (
    <TouchableOpacity
      style={[styles.disputeCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedDispute(dispute);
        setShowDisputeModal(true);
      }}
    >
      <View style={styles.disputeHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(dispute.status) }]} />
        <View style={styles.disputeInfo}>
          <Text style={[styles.disputeReason, { color: theme.text }]}>
            {dispute.reason}
          </Text>
          <View style={styles.disputeParties}>
            <Text style={[styles.partyText, { color: theme.secondaryText }]}>
              {dispute.reporterName}
            </Text>
            <Text style={[styles.vs, { color: theme.tertiaryText }]}>vs</Text>
            <Text style={[styles.partyText, { color: theme.secondaryText }]}>
              {dispute.reportedName}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(dispute.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(dispute.status) }]}>
            {getStatusText(dispute.status)}
          </Text>
        </View>
      </View>
      <Text style={[styles.disputeDescription, { color: theme.secondaryText }]} numberOfLines={2}>
        {dispute.description}
      </Text>
      <View style={styles.disputeFooter}>
        <View style={styles.footerItem}>
          <Clock size={14} color={theme.tertiaryText} />
          <Text style={[styles.footerText, { color: theme.tertiaryText }]}>
            {new Date(dispute.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <MessageCircle size={14} color={theme.tertiaryText} />
          <Text style={[styles.footerText, { color: theme.tertiaryText }]}>
            {dispute.messages.length} {isRTL ? 'رسالة' : 'messages'}
          </Text>
        </View>
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
          {isRTL ? 'النزاعات والشكاوى' : 'Disputes & Complaints'}
        </Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={theme.tertiaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'بحث عن النزاعات...' : 'Search disputes...'}
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterChips}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'open', 'investigating', 'resolved'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterStatus === status ? theme.primary : theme.card,
                  },
                ]}
                onPress={() => setFilterStatus(status as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: filterStatus === status ? '#fff' : theme.text },
                  ]}
                >
                  {status === 'all' ? (isRTL ? 'الكل' : 'All') : getStatusText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredDisputes.map(dispute => (
          <DisputeCard key={dispute.id} dispute={dispute} />
        ))}
      </ScrollView>

      <Modal
        visible={showDisputeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedDispute && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    <AlertCircle size={24} color={getStatusColor(selectedDispute.status)} />
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {selectedDispute.reason}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowDisputeModal(false)}>
                    <XCircle size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'المُبلِّغ' : 'Reporter'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedDispute.reporterName}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'المُبلَّغ عنه' : 'Reported'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedDispute.reportedName}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'الوصف' : 'Description'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedDispute.description}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </Text>
                    <Text style={[styles.modalValue, { color: getStatusColor(selectedDispute.status) }]}>
                      {getStatusText(selectedDispute.status)}
                    </Text>
                  </View>

                  {(selectedDispute.status === 'open' || selectedDispute.status === 'investigating') && (
                    <>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                        placeholder={isRTL ? 'قرار الحل' : 'Resolution decision'}
                        placeholderTextColor={theme.tertiaryText}
                        value={resolution}
                        onChangeText={setResolution}
                        multiline
                      />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                        placeholder={isRTL ? 'مبلغ الاسترداد (اختياري)' : 'Refund amount (optional)'}
                        placeholderTextColor={theme.tertiaryText}
                        value={refundAmount}
                        onChangeText={setRefundAmount}
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                        placeholder={isRTL ? 'رسالة للأطراف' : 'Message to parties'}
                        placeholderTextColor={theme.tertiaryText}
                        value={adminMessage}
                        onChangeText={setAdminMessage}
                        multiline
                      />
                    </>
                  )}

                  {selectedDispute.messages.length > 0 && (
                    <View style={styles.messagesSection}>
                      <Text style={[styles.messagesTitle, { color: theme.text }]}>
                        {isRTL ? 'الرسائل' : 'Messages'}
                      </Text>
                      {selectedDispute.messages.map(msg => (
                        <View
                          key={msg.id}
                          style={[styles.messageCard, { backgroundColor: theme.inputBackground }]}
                        >
                          <Text style={[styles.messageSender, { color: theme.primary }]}>
                            {msg.senderName}
                          </Text>
                          <Text style={[styles.messageText, { color: theme.text }]}>
                            {msg.message}
                          </Text>
                          <Text style={[styles.messageTime, { color: theme.tertiaryText }]}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                {(selectedDispute.status === 'open' || selectedDispute.status === 'investigating') && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                      onPress={() => handleResolve('Resolved in favor of reporter')}
                      disabled={!resolution}
                    >
                      <CheckCircle size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {isRTL ? 'حل لصالح المُبلِّغ' : 'Favor Reporter'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                      onPress={() => handleResolve('Resolved in favor of reported')}
                      disabled={!resolution}
                    >
                      <XCircle size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {isRTL ? 'حل لصالح المُبلَّغ عنه' : 'Favor Reported'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  disputeCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  disputeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  disputeInfo: {
    flex: 1,
  },
  disputeReason: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  disputeParties: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partyText: {
    fontSize: 14,
  },
  vs: {
    fontSize: 12,
    fontStyle: 'italic' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  disputeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  disputeFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    flex: 1,
  },
  modalBody: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 12,
  },
  messagesSection: {
    marginTop: 24,
  },
  messagesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  messageCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
