import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, Percent, Edit2, Save } from 'lucide-react-native';

type FeeConfig = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  category: string;
};

export default function FeesManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [fees, setFees] = useState<FeeConfig[]>([
    {
      id: '1',
      nameEn: 'Platform Commission',
      nameAr: 'عمولة المنصة',
      type: 'percentage',
      value: 15,
      description: isRTL ? 'العمولة على كل طلب مكتمل' : 'Commission on every completed order',
      category: 'commission',
    },
    {
      id: '2',
      nameEn: 'Withdrawal Fee (Bank Transfer)',
      nameAr: 'رسوم السحب (تحويل بنكي)',
      type: 'fixed',
      value: 5,
      description: isRTL ? 'رسوم ثابتة للسحب عبر البنك' : 'Fixed fee for bank withdrawals',
      category: 'withdrawal',
    },
    {
      id: '3',
      nameEn: 'Withdrawal Fee (Card)',
      nameAr: 'رسوم السحب (بطاقة)',
      type: 'percentage',
      value: 2,
      description: isRTL ? 'نسبة مئوية للسحب عبر البطاقة' : 'Percentage fee for card withdrawals',
      category: 'withdrawal',
    },
    {
      id: '4',
      nameEn: 'Featured Gig (Weekly)',
      nameAr: 'خدمة مميزة (أسبوعي)',
      type: 'fixed',
      value: 20,
      description: isRTL ? 'تكلفة إبراز الخدمة لمدة أسبوع' : 'Cost to feature a gig for one week',
      category: 'promotion',
    },
    {
      id: '5',
      nameEn: 'Featured Gig (Monthly)',
      nameAr: 'خدمة مميزة (شهري)',
      type: 'fixed',
      value: 50,
      description: isRTL ? 'تكلفة إبراز الخدمة لمدة شهر' : 'Cost to feature a gig for one month',
      category: 'promotion',
    },
    {
      id: '6',
      nameEn: 'Service Fee',
      nameAr: 'رسوم الخدمة',
      type: 'percentage',
      value: 3,
      description: isRTL ? 'رسوم إضافية على المشتري' : 'Additional fee charged to buyers',
      category: 'service',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeConfig | null>(null);
  const [newValue, setNewValue] = useState('');

  const handleEditFee = (fee: FeeConfig) => {
    setEditingFee(fee);
    setNewValue(fee.value.toString());
    setModalVisible(true);
  };

  const handleSaveFee = () => {
    if (editingFee) {
      setFees(fees.map(f => 
        f.id === editingFee.id 
          ? { ...f, value: parseFloat(newValue) || 0 }
          : f
      ));
    }
    setModalVisible(false);
    setEditingFee(null);
    setNewValue('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commission': return '#10b981';
      case 'withdrawal': return '#3b82f6';
      case 'promotion': return '#f59e0b';
      case 'service': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const FeeCard = ({ fee }: { fee: FeeConfig }) => {
    const color = getCategoryColor(fee.category);
    
    return (
      <View style={[styles.feeCard, { backgroundColor: theme.card }]}>
        <View style={styles.feeHeader}>
          <View style={[styles.feeIcon, { backgroundColor: color + '20' }]}>
            {fee.type === 'percentage' ? (
              <Percent size={24} color={color} />
            ) : (
              <DollarSign size={24} color={color} />
            )}
          </View>
          <View style={styles.feeInfo}>
            <Text style={[styles.feeTitle, { color: theme.text }]}>
              {isRTL ? fee.nameAr : fee.nameEn}
            </Text>
            <Text style={[styles.feeDescription, { color: theme.secondaryText }]}>
              {fee.description}
            </Text>
          </View>
        </View>

        <View style={styles.feeValue}>
          <Text style={[styles.feeAmount, { color: theme.text }]}>
            {fee.type === 'percentage' ? `${fee.value}%` : `$${fee.value}`}
          </Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => handleEditFee(fee)}
          >
            <Edit2 size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const categories = [
    { key: 'commission', nameEn: 'Platform Commission', nameAr: 'عمولة المنصة' },
    { key: 'withdrawal', nameEn: 'Withdrawal Fees', nameAr: 'رسوم السحب' },
    { key: 'promotion', nameEn: 'Promotion Fees', nameAr: 'رسوم الترويج' },
    { key: 'service', nameEn: 'Service Fees', nameAr: 'رسوم الخدمة' },
  ];

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
            {isRTL ? 'إدارة الرسوم والعمولات' : 'Fee & Commission Control'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const categoryFees = fees.filter(f => f.category === category.key);
          if (categoryFees.length === 0) return null;

          return (
            <View key={category.key} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {isRTL ? category.nameAr : category.nameEn}
              </Text>
              {categoryFees.map((fee) => (
                <FeeCard key={fee.id} fee={fee} />
              ))}
            </View>
          );
        })}

        <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>
            {isRTL ? 'ملخص الإيرادات (شهري)' : 'Revenue Summary (Monthly)'}
          </Text>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'إجمالي العمولات' : 'Total Commissions'}
            </Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>$24,580</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'رسوم الخدمة' : 'Service Fees'}
            </Text>
            <Text style={[styles.summaryValue, { color: '#8b5cf6' }]}>$4,920</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'رسوم الترويج' : 'Promotion Fees'}
            </Text>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>$3,200</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryTotal, { color: theme.text }]}>
              {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </Text>
            <Text style={[styles.summaryTotalValue, { color: theme.primary }]}>$32,700</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {isRTL ? 'تعديل القيمة' : 'Edit Value'}
            </Text>
            
            {editingFee && (
              <>
                <Text style={[styles.modalLabel, { color: theme.secondaryText }]}>
                  {isRTL ? editingFee.nameAr : editingFee.nameEn}
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={newValue}
                    onChangeText={setNewValue}
                    keyboardType="numeric"
                    placeholder={editingFee.type === 'percentage' ? '15' : '5'}
                    placeholderTextColor={theme.secondaryText}
                  />
                  <Text style={[styles.inputSuffix, { color: theme.text }]}>
                    {editingFee.type === 'percentage' ? '%' : '$'}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalButtons}>
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
                onPress={handleSaveFee}
              >
                <Save size={18} color="#fff" />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  feeCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  feeInfo: {
    flex: 1,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  feeDescription: {
    fontSize: 14,
  },
  feeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
