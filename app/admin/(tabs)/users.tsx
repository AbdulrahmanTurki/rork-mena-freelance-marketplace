import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdmin, User } from '@/contexts/AdminContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAdminVerifications, useApproveVerification, useRejectVerification } from '@/hooks/useAdminVerifications';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Calendar,
  FileText,
  Phone,
  MapPin,
} from 'lucide-react-native';

export default function UsersManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { users, adminUser, suspendUser, verifyUser } = useAdmin();
  const insets = useSafeAreaInsets();
  
  const { data: dbUsers, isLoading: isLoadingUsers } = useAdminUsers();
  const { data: verifications, isLoading: isLoadingVerifications } = useAdminVerifications();
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'seller'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'suspended' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionReason, setActionReason] = useState('');

  const isRTL = language === 'ar';

  const mergedUsers = useMemo(() => {
    if (!dbUsers) return users;
    
    return dbUsers.map(dbUser => {
      const verification = verifications?.find(v => v.user_id === dbUser.id);
      
      if (verification) {
        console.log('[mergedUsers] Found verification for user:', dbUser.email);
        console.log('[mergedUsers] Verification URLs:', {
          id_front_url: verification.id_front_url,
          id_back_url: verification.id_back_url,
          permit_document_url: verification.permit_document_url,
        });
      }
      
      const status = verification?.status === 'pending' && dbUser.user_type === 'seller' 
        ? 'pending'
        : dbUser.mobile_verified && dbUser.email_verified
        ? 'active'
        : 'pending';
      
      return {
        id: dbUser.id,
        name: dbUser.full_name || dbUser.email.split('@')[0],
        email: dbUser.email,
        type: dbUser.user_type as 'buyer' | 'seller',
        status: status as 'active' | 'suspended' | 'banned' | 'pending',
        verified: dbUser.mobile_verified && dbUser.email_verified,
        joinedDate: dbUser.created_at,
        fullProfile: {
          fullName: dbUser.full_name,
          fullNameArabic: dbUser.full_name_arabic,
          nationalId: dbUser.national_id,
          dateOfBirth: dbUser.date_of_birth,
          nationality: dbUser.nationality,
          gender: dbUser.gender,
          mobileNumber: dbUser.mobile_number,
          city: dbUser.city,
        },
        verification: verification ? {
          id: verification.id,
          permitNumber: verification.permit_number,
          permitExpiration: verification.permit_expiration_date,
          idFrontUrl: verification.id_front_url,
          idBackUrl: verification.id_back_url,
          permitDocumentUrl: verification.permit_document_url,
          status: verification.status,
          rejectionReason: verification.rejection_reason,
        } : undefined,
      } as User & { verification?: any; fullProfile?: any };
    });
  }, [dbUsers, verifications, users]);

  const filteredUsers = mergedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'suspended':
        return '#ef4444';
      case 'banned':
        return '#991b1b';
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'active':
          return 'نشط';
        case 'pending':
          return 'معلق';
        case 'suspended':
          return 'موقوف';
        case 'banned':
          return 'محظور';
        default:
          return status;
      }
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    
    const verification = (selectedUser as any).verification;
    if (!verification) {
      console.error('[handleApprove] No verification data found for user');
      return;
    }

    console.log('[handleApprove] Approving verification:', verification.id);
    try {
      await approveMutation.mutateAsync({
        verificationId: verification.id,
        reviewedBy: adminUser?.id || 'admin1',
      });
      console.log('[handleApprove] Verification approved successfully');
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('[handleApprove] Error:', error);
      console.error('[handleApprove] Error message:', error?.message);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !actionReason) {
      console.error('[handleReject] Missing user or reason');
      return;
    }

    const verification = (selectedUser as any).verification;
    if (!verification) {
      console.error('[handleReject] No verification data found for user');
      return;
    }

    console.log('[handleReject] Rejecting verification:', verification.id);
    try {
      await rejectMutation.mutateAsync({
        verificationId: verification.id,
        reason: actionReason,
        reviewedBy: adminUser?.id || 'admin1',
      });
      console.log('[handleReject] Verification rejected successfully');
      setShowUserModal(false);
      setSelectedUser(null);
      setActionReason('');
    } catch (error: any) {
      console.error('[handleReject] Error:', error);
      console.error('[handleReject] Error message:', error?.message);
    }
  };

  const handleSuspend = async () => {
    if (selectedUser && actionReason) {
      await suspendUser(selectedUser.id, actionReason);
      setShowUserModal(false);
      setSelectedUser(null);
      setActionReason('');
    }
  };

  const handleVerify = async () => {
    if (selectedUser) {
      await verifyUser(selectedUser.id);
      setShowUserModal(false);
      setSelectedUser(null);
    }
  };

  const UserCard = ({ user }: { user: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedUser(user);
        setShowUserModal(true);
      }}
    >
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
            {user.verified && <CheckCircle size={16} color="#10b981" />}
          </View>
          <Text style={[styles.userEmail, { color: theme.secondaryText }]}>{user.email}</Text>
          <View style={styles.userMeta}>
            <View style={[styles.typeBadge, { backgroundColor: user.type === 'seller' ? '#8b5cf620' : '#3b82f620' }]}>
              <Text style={[styles.typeText, { color: user.type === 'seller' ? '#8b5cf6' : '#3b82f6' }]}>
                {user.type === 'seller' ? (isRTL ? 'بائع' : 'Seller') : (isRTL ? 'مشتري' : 'Buyer')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                {getStatusText(user.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userFooter}>
        <View style={styles.statItem}>
          <Calendar size={14} color={theme.tertiaryText} />
          <Text style={[styles.statText, { color: theme.tertiaryText }]}>
            {new Date(user.joinedDate).toLocaleDateString()}
          </Text>
        </View>
        {user.totalOrders !== undefined && (
          <View style={styles.statItem}>
            <Text style={[styles.statText, { color: theme.tertiaryText }]}>
              {user.totalOrders} {isRTL ? 'طلب' : 'orders'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoadingUsers || isLoadingVerifications) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBackground, paddingTop: insets.top + 16 },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isRTL ? 'إدارة المستخدمين' : 'User Management'}
        </Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={theme.tertiaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={isRTL ? 'بحث عن المستخدمين...' : 'Search users...'}
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Filter size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.filterChips}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'active', 'pending', 'suspended'].map(status => (
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
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </ScrollView>

      <Modal
        visible={showUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedUser && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedUser.name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowUserModal(false)}>
                    <XCircle size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {selectedUser && (selectedUser as any).verification && (
                    <View style={{ padding: 10, backgroundColor: '#f0f0f0', marginBottom: 10 }}>
                      <Text style={{ fontSize: 10, fontFamily: 'monospace' as const }}>
                        DEBUG: Verification data present
                      </Text>
                      <Text style={{ fontSize: 10, fontFamily: 'monospace' as const }}>
                        idFrontUrl: {(selectedUser as any).verification.idFrontUrl ? 'YES' : 'NO'}
                      </Text>
                      <Text style={{ fontSize: 10, fontFamily: 'monospace' as const }}>
                        idBackUrl: {(selectedUser as any).verification.idBackUrl ? 'YES' : 'NO'}
                      </Text>
                      <Text style={{ fontSize: 10, fontFamily: 'monospace' as const }}>
                        permitDocumentUrl: {(selectedUser as any).verification.permitDocumentUrl ? 'YES' : 'NO'}
                      </Text>
                    </View>
                  )}
                  {selectedUser && !(selectedUser as any).verification && (
                    <View style={{ padding: 10, backgroundColor: '#ffcccc', marginBottom: 10 }}>
                      <Text style={{ fontSize: 10, fontFamily: 'monospace' as const }}>
                        DEBUG: NO verification data found for this user
                      </Text>
                    </View>
                  )}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedUser.email}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'النوع' : 'Type'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {selectedUser.type === 'seller' ? (isRTL ? 'بائع' : 'Seller') : (isRTL ? 'مشتري' : 'Buyer')}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </Text>
                    <Text style={[styles.modalValue, { color: getStatusColor(selectedUser.status) }]}>
                      {getStatusText(selectedUser.status)}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                      {isRTL ? 'تاريخ الانضمام' : 'Joined Date'}
                    </Text>
                    <Text style={[styles.modalValue, { color: theme.text }]}>
                      {new Date(selectedUser.joinedDate).toLocaleDateString()}
                    </Text>
                  </View>

                  {selectedUser.type === 'seller' && (selectedUser as any).fullProfile && (
                    <>
                      <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {isRTL ? 'المعلومات الشخصية الكاملة' : 'Full Personal Information'}
                      </Text>

                      {(selectedUser as any).fullProfile.fullNameArabic && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.fullNameArabic}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.nationalId && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'رقم الهوية الوطنية/الإقامة' : 'National ID/Iqama'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.nationalId}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.dateOfBirth && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {new Date((selectedUser as any).fullProfile.dateOfBirth).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.nationality && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'الجنسية' : 'Nationality'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.nationality}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.gender && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'الجنس' : 'Gender'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.gender}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.mobileNumber && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'رقم الجوال' : 'Mobile Number'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.mobileNumber}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).fullProfile.city && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'المدينة' : 'City'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).fullProfile.city}
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {selectedUser.type === 'seller' && (selectedUser as any).verification && (
                    <>
                      <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {isRTL ? 'معلومات التحقق' : 'Verification Information'}
                      </Text>

                      {(selectedUser as any).verification.permitNumber && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'رقم رخصة العمل الحر' : 'Freelance Permit Number'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {(selectedUser as any).verification.permitNumber}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).verification.permitExpiration && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'تاريخ انتهاء الرخصة' : 'Permit Expiration Date'}
                          </Text>
                          <Text style={[styles.modalValue, { color: theme.text }]}>
                            {new Date((selectedUser as any).verification.permitExpiration).toLocaleDateString()}
                          </Text>
                        </View>
                      )}

                      {(selectedUser as any).verification.status && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'حالة التحقق' : 'Verification Status'}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor((selectedUser as any).verification.status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor((selectedUser as any).verification.status) }]}>
                              {getStatusText((selectedUser as any).verification.status)}
                            </Text>
                          </View>
                        </View>
                      )}

                      {(selectedUser as any).verification.rejectionReason && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'سبب الرفض' : 'Rejection Reason'}
                          </Text>
                          <Text style={[styles.modalValue, { color: '#ef4444' }]}>
                            {(selectedUser as any).verification.rejectionReason}
                          </Text>
                        </View>
                      )}

                      <View style={[styles.sectionDivider, { backgroundColor: theme.border }]} />
                      <View style={[styles.documentsHeader, { backgroundColor: theme.primary + '10' }]}>
                        <FileText size={20} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                          {isRTL ? 'المستندات المرفقة' : 'Attached Documents'}
                        </Text>
                      </View>

                      {(selectedUser as any).verification.idFrontUrl && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'صورة الهوية - الوجه الأمامي' : 'ID Front Image'}
                          </Text>
                          <Text style={[styles.debugText, { color: theme.tertiaryText }]}>
                            URL: {(selectedUser as any).verification.idFrontUrl}
                          </Text>
                          <Image
                            source={{ uri: (selectedUser as any).verification.idFrontUrl }}
                            style={styles.documentImage}
                            resizeMode="contain"
                            onError={(e) => console.log('[Image Error] ID Front:', e.nativeEvent.error)}
                            onLoad={() => console.log('[Image Loaded] ID Front')}
                          />
                        </View>
                      )}

                      {(selectedUser as any).verification.idBackUrl && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'صورة الهوية - الوجه الخلفي' : 'ID Back Image'}
                          </Text>
                          <Text style={[styles.debugText, { color: theme.tertiaryText }]}>
                            URL: {(selectedUser as any).verification.idBackUrl}
                          </Text>
                          <Image
                            source={{ uri: (selectedUser as any).verification.idBackUrl }}
                            style={styles.documentImage}
                            resizeMode="contain"
                            onError={(e) => console.log('[Image Error] ID Back:', e.nativeEvent.error)}
                            onLoad={() => console.log('[Image Loaded] ID Back')}
                          />
                        </View>
                      )}

                      {(selectedUser as any).verification.permitDocumentUrl && (
                        <View style={styles.modalSection}>
                          <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                            {isRTL ? 'وثيقة رخصة العمل الحر' : 'Freelance Permit Document'}
                          </Text>
                          <Text style={[styles.debugText, { color: theme.tertiaryText }]}>
                            URL: {(selectedUser as any).verification.permitDocumentUrl}
                          </Text>
                          <Image
                            source={{ uri: (selectedUser as any).verification.permitDocumentUrl }}
                            style={styles.documentImage}
                            resizeMode="contain"
                            onError={(e) => console.log('[Image Error] Permit:', e.nativeEvent.error)}
                            onLoad={() => console.log('[Image Loaded] Permit')}
                          />
                        </View>
                      )}
                    </>
                  )}

                  {(selectedUser.status === 'pending' || selectedUser.status === 'active') && (
                    <TextInput
                      style={[
                        styles.reasonInput,
                        {
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder={isRTL ? 'سبب الإجراء (اختياري)' : 'Action reason (optional)'}
                      placeholderTextColor={theme.tertiaryText}
                      value={actionReason}
                      onChangeText={setActionReason}
                      multiline
                    />
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  {selectedUser.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                        onPress={handleApprove}
                      >
                        <UserCheck size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {isRTL ? 'موافقة' : 'Approve'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                        onPress={handleReject}
                      >
                        <UserX size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {isRTL ? 'رفض' : 'Reject'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {selectedUser.status === 'active' && (
                    <>
                      {!selectedUser.verified && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                          onPress={handleVerify}
                        >
                          <Shield size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>
                            {isRTL ? 'توثيق' : 'Verify'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                        onPress={handleSuspend}
                      >
                        <AlertCircle size={20} color="#fff" />
                        <Text style={styles.actionButtonText}>
                          {isRTL ? 'إيقاف' : 'Suspend'}
                        </Text>
                      </TouchableOpacity>
                    </>
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
  userCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500' as const,
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
  userFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  modalBody: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexGrow: 1,
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
  sectionDivider: {
    height: 1,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  documentImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  debugText: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace' as const,
  },
  documentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
});
