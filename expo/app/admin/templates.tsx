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
import { ArrowLeft, Mail, MessageSquare, Edit2 } from 'lucide-react-native';

type Template = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'email' | 'sms';
  subject: string;
  body: string;
  variables: string[];
};

export default function TemplatesScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      nameEn: 'Order Confirmation',
      nameAr: 'تأكيد الطلب',
      type: 'email',
      subject: 'Order Confirmation - #{ORDER_ID}',
      body: 'Hello {NAME},\n\nYour order #{ORDER_ID} has been confirmed.',
      variables: ['NAME', 'ORDER_ID'],
    },
    {
      id: '2',
      nameEn: 'Welcome Message',
      nameAr: 'رسالة ترحيب',
      type: 'email',
      subject: 'Welcome to Khedmah!',
      body: 'Welcome {NAME}! We are excited to have you.',
      variables: ['NAME'],
    },
    {
      id: '3',
      nameEn: 'Order Delivered SMS',
      nameAr: 'رسالة تسليم الطلب',
      type: 'sms',
      subject: '',
      body: 'Your order #{ORDER_ID} has been delivered!',
      variables: ['ORDER_ID'],
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setModalVisible(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    }
    setModalVisible(false);
    setEditingTemplate(null);
  };

  const TemplateCard = ({ template }: { template: Template }) => (
    <TouchableOpacity
      style={[styles.templateCard, { backgroundColor: theme.card }]}
      onPress={() => handleEditTemplate(template)}
    >
      <View style={styles.templateHeader}>
        <View style={[styles.typeIcon, { backgroundColor: theme.primary + '20' }]}>
          {template.type === 'email' ? (
            <Mail size={20} color={theme.primary} />
          ) : (
            <MessageSquare size={20} color={theme.primary} />
          )}
        </View>
        <View style={styles.templateInfo}>
          <Text style={[styles.templateName, { color: theme.text }]}>
            {isRTL ? template.nameAr : template.nameEn}
          </Text>
          <Text style={[styles.templateType, { color: theme.secondaryText }]}>
            {template.type.toUpperCase()}
          </Text>
        </View>
        <Edit2 size={20} color={theme.secondaryText} />
      </View>

      {template.subject && (
        <Text style={[styles.templateSubject, { color: theme.text }]}>
          {template.subject}
        </Text>
      )}

      <Text style={[styles.templateBody, { color: theme.secondaryText }]} numberOfLines={2}>
        {template.body}
      </Text>

      <View style={styles.variablesContainer}>
        {template.variables.map((variable, index) => (
          <View key={index} style={[styles.variableTag, { backgroundColor: theme.background }]}>
            <Text style={[styles.variableText, { color: theme.text }]}>
              {`{${variable}}`}
            </Text>
          </View>
        ))}
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
            {isRTL ? 'قوالب البريد والرسائل' : 'Email/SMS Templates'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
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
                {isRTL ? 'تعديل القالب' : 'Edit Template'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {editingTemplate && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {editingTemplate.type === 'email' && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>
                      {isRTL ? 'الموضوع' : 'Subject'}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                      value={editingTemplate.subject}
                      onChangeText={(text) => setEditingTemplate({ ...editingTemplate, subject: text })}
                      placeholderTextColor={theme.secondaryText}
                    />
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'المحتوى' : 'Body'}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                    value={editingTemplate.body}
                    onChangeText={(text) => setEditingTemplate({ ...editingTemplate, body: text })}
                    multiline
                    numberOfLines={6}
                    placeholderTextColor={theme.secondaryText}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'المتغيرات المتاحة' : 'Available Variables'}
                  </Text>
                  <View style={styles.variablesContainer}>
                    {editingTemplate.variables.map((variable, index) => (
                      <View key={index} style={[styles.variableTag, { backgroundColor: theme.background }]}>
                        <Text style={[styles.variableText, { color: theme.text }]}>
                          {`{${variable}}`}
                        </Text>
                      </View>
                    ))}
                  </View>
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
                onPress={handleSaveTemplate}
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
  templateCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  templateType: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  templateSubject: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  templateBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  variablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variableTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  variableText: {
    fontSize: 12,
    fontWeight: '600' as const,
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
    height: 120,
    textAlignVertical: 'top',
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
