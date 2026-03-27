import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, Gig } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Pause,
  Star,
  DollarSign,
  ShoppingBag,
} from 'lucide-react-native';

export default function GigsManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { gigs, approveGig, rejectGig, pauseGig } = useAdmin();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending_approval' | 'paused' | 'rejected'>('all');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [showGigModal, setShowGigModal] = useState(false);
  const [actionReason, setActionReason] = useState('');

  const isRTL = language === 'ar';

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || gig.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending_approval':
        return '#f59e0b';
      case 'paused':
        return '#6b7280';
      case 'rejected':
        return '#ef4444';
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'active':
          return 'نشط';
        case 'pending_approval':
          return 'معلق';
        case 'paused':
          return 'متوقف';
        case 'rejected':
          return 'مرفوض';
        default:
          return status;
      }
    }
    switch (status) {
      case 'pending_approval':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleApprove = async () => {
    if (selectedGig) {
      await approveGig(selectedGig.id);
      setShowGigModal(false);
      setSelectedGig(null);
    }
  };

  const handleReject = async () => {
    if (selectedGig && actionReason) {
      await rejectGig(selectedGig.id, actionReason);
      setShowGigModal(false);
      setSelectedGig(null);
      setActionReason('');
    }
  };

  const handlePause = async () => {
    if (selectedGig) {
      await pauseGig(selectedGig.id);
      setShowGigModal(false);
      setSelectedGig(null);
    }
  };

  const GigCard = ({ gig }: { gig: Gig }) => (
    <TouchableOpacity
      style={[styles.gigCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedGig(gig);
        setShowGigModal(true);
      }}
    >
      {gig.image && (
        <Image source={{ uri: gig.image }} style={styles.gigImage} />
      )}
      <View style={styles.gigContent}>
        <View style={styles.gigHeader}>
          <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
            {gig.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(gig.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(gig.status) }]}>
              {getStatusText(gig.status)}
            </Text>
          </View>
        </View>
        <Text style={[styles.sellerName, { color: theme.secondaryText }]}>
          {isRTL ? 'بواسطة' : 'by'} {gig.sellerName}
        </Text>
        <View style={styles.gigMeta}>
          <View style={styles.metaItem}>
            <DollarSign size={14} color={theme.primary} />
            <Text style={[styles.metaText, { color: theme.text }]}>{gig.price} {isRTL ? 'ريال' : 'SAR'}</Text>
          </View>
          {gig.rating && (
            <View style={styles.metaItem}>
              <Star size={14} color="#fbbf24" />
              <Text style={[styles.metaText, { color: theme.text }]}>{gig.rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <ShoppingBag size={14} color={theme.secondaryText} />
            <Text style={[styles.metaText, { color: theme.text }]}>{gig.orders}</Text>
          </View>
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
          {isRTL ? 'إدارة الخدمات' : 'Gig Management'}
        </Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={theme.tertiaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'بحث عن الخدمات...' : 'Search gigs...'}
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterChips}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'pending_approval', 'active', 'paused', 'rejected'].map(status => (
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
        {filteredGigs.map(gig => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </ScrollView>

      <Modal
        visible={showGigModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGigModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedGig && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedGig.title}
                  </Text>
                  <TouchableOpacity onPress={() => setShowGigModal(false)}>
                    <XCircle size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'البائع' : 'Seller'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedGig.sellerName}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'الفئة' : 'Category'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedGig.category}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'السعر' : 'Price'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedGig.price} {isRTL ? 'ريال' : 'SAR'}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </Text>
                    <Text style={[styles.modalValue, { color: getStatusColor(selectedGig.status) }]}>
                      {getStatusText(selectedGig.status)}
                    </Text>
                  </View>

                  {(selectedGig.status === 'pending_approval' || selectedGig.status === 'active') && (
                    <TextInput
                      style={[
                        styles.reasonInput,
                        {
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder={isRTL ? 'سبب الإجراء (مطلوب للرفض)' : 'Reason (required for rejection)'}
                      placeholderTextColor={theme.tertiaryText}
                      value={actionReason}
                      onChangeText={setActionReason}
                      multiline
                    />
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedGig.status === 'pending_approval' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                        onPress={handleApprove}
                      >
                        <CheckCircle size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {isRTL ? 'موافقة' : 'Approve'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                        onPress={handleReject}
                        disabled={!actionReason}
                      >
                        <XCircle size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {isRTL ? 'رفض' : 'Reject'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedGig.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                      onPress={handlePause}
                    >
                      <Pause size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {isRTL ? 'إيقاف' : 'Pause'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  gigCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gigImage: {
    width: '100%',
    height: 150,
  },
  gigContent: {
    padding: 16,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 12,
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
  sellerName: {
    fontSize: 14,
    marginBottom: 12,
  },
  gigMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500' as const,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 12,
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
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginTop: 16,
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
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
