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
import { ArrowLeft, Globe, Edit2 } from 'lucide-react-native';

type Translation = {
  key: string;
  en: string;
  ar: string;
  category: string;
};

export default function LocalizationScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [translations, setTranslations] = useState<Translation[]>([
    { key: 'welcome_message', en: 'Welcome to Khedmah', ar: 'مرحباً بك في خدمة', category: 'general' },
    { key: 'order_placed', en: 'Order Placed Successfully', ar: 'تم تقديم الطلب بنجاح', category: 'orders' },
    { key: 'payment_received', en: 'Payment Received', ar: 'تم استلام الدفعة', category: 'payments' },
    { key: 'gig_approved', en: 'Your gig has been approved', ar: 'تمت الموافقة على خدمتك', category: 'gigs' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation);
    setModalVisible(true);
  };

  const handleSaveTranslation = () => {
    if (editingTranslation) {
      setTranslations(translations.map(t => t.key === editingTranslation.key ? editingTranslation : t));
    }
    setModalVisible(false);
    setEditingTranslation(null);
  };

  const TranslationCard = ({ translation }: { translation: Translation }) => (
    <TouchableOpacity
      style={[styles.translationCard, { backgroundColor: theme.card }]}
      onPress={() => handleEditTranslation(translation)}
    >
      <View style={styles.translationHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.categoryText, { color: theme.primary }]}>
            {translation.category}
          </Text>
        </View>
        <Edit2 size={18} color={theme.secondaryText} />
      </View>

      <Text style={[styles.translationKey, { color: theme.secondaryText }]}>
        {translation.key}
      </Text>

      <View style={styles.translationValues}>
        <View style={styles.langValue}>
          <Text style={[styles.langLabel, { color: theme.secondaryText }]}>EN</Text>
          <Text style={[styles.langText, { color: theme.text }]}>{translation.en}</Text>
        </View>
        <View style={styles.langValue}>
          <Text style={[styles.langLabel, { color: theme.secondaryText }]}>AR</Text>
          <Text style={[styles.langText, { color: theme.text }]}>{translation.ar}</Text>
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
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isRTL ? 'التحكم بالترجمات' : 'Localization Controls'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Globe size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            {isRTL 
              ? 'إدارة الترجمات للغة الإنجليزية والعربية'
              : 'Manage English and Arabic translations'}
          </Text>
        </View>

        {translations.map((translation) => (
          <TranslationCard key={translation.key} translation={translation} />
        ))}
      </ScrollView>

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
                {isRTL ? 'تعديل الترجمة' : 'Edit Translation'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {editingTranslation && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'المفتاح' : 'Key'}
                  </Text>
                  <Text style={[styles.keyText, { color: theme.secondaryText }]}>
                    {editingTranslation.key}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'الإنجليزية' : 'English'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={editingTranslation.en}
                    onChangeText={(text) => setEditingTranslation({ ...editingTranslation, en: text })}
                    placeholderTextColor={theme.secondaryText}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'العربية' : 'Arabic'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={editingTranslation.ar}
                    onChangeText={(text) => setEditingTranslation({ ...editingTranslation, ar: text })}
                    placeholderTextColor={theme.secondaryText}
                  />
                </View>
              </ScrollView>
            )}

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
                onPress={handleSaveTranslation}
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  translationCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  translationKey: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  translationValues: {
    gap: 8,
  },
  langValue: {
    flexDirection: 'row',
    gap: 12,
  },
  langLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    width: 24,
  },
  langText: {
    flex: 1,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  keyText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
