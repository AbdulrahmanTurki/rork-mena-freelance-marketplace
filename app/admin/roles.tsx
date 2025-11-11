import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Shield, Edit2, Trash2, Users } from 'lucide-react-native';

type Permission = {
  id: string;
  name: string;
  category: string;
};

type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
};

export default function RolesManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'super_admin',
      displayName: isRTL ? 'مسؤول عام' : 'Super Admin',
      description: isRTL ? 'صلاحيات كاملة على النظام' : 'Full system access and control',
      userCount: 2,
      permissions: ['all'],
      color: '#ef4444',
    },
    {
      id: '2',
      name: 'support_agent',
      displayName: isRTL ? 'وكيل الدعم' : 'Support Agent',
      description: isRTL ? 'إدارة التذاكر والشكاوى' : 'Manage support tickets and complaints',
      userCount: 8,
      permissions: ['view_users', 'manage_support', 'view_orders', 'manage_disputes'],
      color: '#3b82f6',
    },
    {
      id: '3',
      name: 'finance_admin',
      displayName: isRTL ? 'مسؤول مالي' : 'Finance Admin',
      description: isRTL ? 'إدارة المدفوعات والسحوبات' : 'Manage payments and withdrawals',
      userCount: 3,
      permissions: ['view_payments', 'approve_withdrawals', 'view_analytics', 'manage_fees'],
      color: '#10b981',
    },
    {
      id: '4',
      name: 'content_moderator',
      displayName: isRTL ? 'مشرف محتوى' : 'Content Moderator',
      description: isRTL ? 'مراجعة وإدارة المحتوى' : 'Review and manage content',
      userCount: 5,
      permissions: ['view_gigs', 'approve_gigs', 'manage_content', 'view_users'],
      color: '#f59e0b',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
  });

  const allPermissions: Permission[] = [
    { id: 'view_users', name: isRTL ? 'عرض المستخدمين' : 'View Users', category: 'users' },
    { id: 'manage_users', name: isRTL ? 'إدارة المستخدمين' : 'Manage Users', category: 'users' },
    { id: 'ban_users', name: isRTL ? 'حظر المستخدمين' : 'Ban Users', category: 'users' },
    { id: 'view_gigs', name: isRTL ? 'عرض الخدمات' : 'View Gigs', category: 'gigs' },
    { id: 'approve_gigs', name: isRTL ? 'الموافقة على الخدمات' : 'Approve Gigs', category: 'gigs' },
    { id: 'manage_gigs', name: isRTL ? 'إدارة الخدمات' : 'Manage Gigs', category: 'gigs' },
    { id: 'view_orders', name: isRTL ? 'عرض الطلبات' : 'View Orders', category: 'orders' },
    { id: 'manage_orders', name: isRTL ? 'إدارة الطلبات' : 'Manage Orders', category: 'orders' },
    { id: 'view_payments', name: isRTL ? 'عرض المدفوعات' : 'View Payments', category: 'payments' },
    { id: 'approve_withdrawals', name: isRTL ? 'الموافقة على السحب' : 'Approve Withdrawals', category: 'payments' },
    { id: 'manage_fees', name: isRTL ? 'إدارة الرسوم' : 'Manage Fees', category: 'payments' },
    { id: 'manage_disputes', name: isRTL ? 'إدارة النزاعات' : 'Manage Disputes', category: 'support' },
    { id: 'manage_support', name: isRTL ? 'إدارة الدعم' : 'Manage Support', category: 'support' },
    { id: 'view_analytics', name: isRTL ? 'عرض التحليلات' : 'View Analytics', category: 'analytics' },
    { id: 'manage_content', name: isRTL ? 'إدارة المحتوى' : 'Manage Content', category: 'content' },
    { id: 'manage_settings', name: isRTL ? 'إدارة الإعدادات' : 'Manage Settings', category: 'settings' },
  ];

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSaveRole = () => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...editingRole, ...newRole } : r));
    } else {
      setRoles([...roles, {
        id: Date.now().toString(),
        name: newRole.name,
        displayName: newRole.displayName,
        description: newRole.description,
        permissions: newRole.permissions,
        userCount: 0,
        color: '#8b5cf6',
      }]);
    }
    setModalVisible(false);
    setEditingRole(null);
    setNewRole({ name: '', displayName: '', description: '', permissions: [] });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
    });
    setModalVisible(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
  };

  const RoleCard = ({ role }: { role: Role }) => (
    <View style={[styles.roleCard, { backgroundColor: theme.card }]}>
      <View style={styles.roleHeader}>
        <View style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}>
          <Shield size={24} color={role.color} />
        </View>
        <View style={styles.roleInfo}>
          <Text style={[styles.roleTitle, { color: theme.text }]}>{role.displayName}</Text>
          <Text style={[styles.roleDescription, { color: theme.secondaryText }]}>
            {role.description}
          </Text>
        </View>
      </View>

      <View style={styles.roleStats}>
        <View style={styles.statItem}>
          <Users size={16} color={theme.secondaryText} />
          <Text style={[styles.statText, { color: theme.secondaryText }]}>
            {role.userCount} {isRTL ? 'مستخدمين' : 'users'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Shield size={16} color={theme.secondaryText} />
          <Text style={[styles.statText, { color: theme.secondaryText }]}>
            {role.permissions.includes('all') ? isRTL ? 'كل الصلاحيات' : 'All Permissions' : `${role.permissions.length} ${isRTL ? 'صلاحيات' : 'permissions'}`}
          </Text>
        </View>
      </View>

      {role.name !== 'super_admin' && (
        <View style={styles.roleActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => handleEditRole(role)}
          >
            <Edit2 size={18} color={theme.primary} />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {isRTL ? 'تعديل' : 'Edit'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef444420' }]}
            onPress={() => handleDeleteRole(role.id)}
          >
            <Trash2 size={18} color="#ef4444" />
            <Text style={[styles.actionText, { color: '#ef4444' }]}>
              {isRTL ? 'حذف' : 'Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
            {isRTL ? 'إدارة الأدوار والصلاحيات' : 'Role & Permission Management'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {roles.map((role) => (
          <RoleCard key={role.id} role={role} />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => {
          setEditingRole(null);
          setNewRole({ name: '', displayName: '', description: '', permissions: [] });
          setModalVisible(true);
        }}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingRole ? (isRTL ? 'تعديل الدور' : 'Edit Role') : (isRTL ? 'إضافة دور جديد' : 'Add New Role')}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'اسم الدور (بالإنجليزية)' : 'Role Name (English)'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={newRole.name}
                  onChangeText={(text) => setNewRole({ ...newRole, name: text })}
                  placeholder="support_agent"
                  placeholderTextColor={theme.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الاسم المعروض' : 'Display Name'}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={newRole.displayName}
                  onChangeText={(text) => setNewRole({ ...newRole, displayName: text })}
                  placeholder={isRTL ? 'وكيل الدعم' : 'Support Agent'}
                  placeholderTextColor={theme.secondaryText}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الوصف' : 'Description'}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                  value={newRole.description}
                  onChangeText={(text) => setNewRole({ ...newRole, description: text })}
                  placeholder={isRTL ? 'وصف الدور...' : 'Role description...'}
                  placeholderTextColor={theme.secondaryText}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  {isRTL ? 'الصلاحيات' : 'Permissions'}
                </Text>
                {allPermissions.map((permission) => (
                  <TouchableOpacity
                    key={permission.id}
                    style={[styles.permissionItem, { backgroundColor: theme.background }]}
                    onPress={() => togglePermission(permission.id)}
                  >
                    <Text style={[styles.permissionName, { color: theme.text }]}>
                      {permission.name}
                    </Text>
                    <Switch
                      value={newRole.permissions.includes(permission.id)}
                      onValueChange={() => togglePermission(permission.id)}
                      trackColor={{ false: theme.border, true: theme.primary }}
                      thumbColor="#fff"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveRole}
              >
                <Text style={styles.saveButtonText}>
                  {isRTL ? 'حفظ' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
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
  roleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
  },
  roleStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
  },
  roleActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  closeButton: {
    fontSize: 24,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  permissionName: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
