import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, AlertTriangle, Ban, Flag } from 'lucide-react-native';

type Rule = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: 'fraud' | 'spam' | 'quality' | 'behavior';
  enabled: boolean;
  action: 'flag' | 'suspend' | 'ban' | 'review';
  threshold: number;
  description: string;
};

export default function AutomatedRulesScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [rules, setRules] = useState<Rule[]>([
    {
      id: '1',
      nameEn: 'Fraud Detection',
      nameAr: 'كشف الاحتيال',
      type: 'fraud',
      enabled: true,
      action: 'suspend',
      threshold: 3,
      description: isRTL ? 'تعليق الحساب عند اكتشاف نشاط مشبوه' : 'Suspend account when suspicious activity detected',
    },
    {
      id: '2',
      nameEn: 'Spam Content',
      nameAr: 'محتوى سبام',
      type: 'spam',
      enabled: true,
      action: 'flag',
      threshold: 5,
      description: isRTL ? 'الإبلاغ عن المحتوى المكرر أو غير المرغوب' : 'Flag duplicate or unwanted content',
    },
    {
      id: '3',
      nameEn: 'Low Quality Gigs',
      nameAr: 'خدمات منخفضة الجودة',
      type: 'quality',
      enabled: true,
      action: 'review',
      threshold: 2,
      description: isRTL ? 'مراجعة الخدمات ذات التقييمات المنخفضة' : 'Review gigs with low ratings',
    },
    {
      id: '4',
      nameEn: 'Abusive Behavior',
      nameAr: 'سلوك مسيء',
      type: 'behavior',
      enabled: true,
      action: 'ban',
      threshold: 1,
      description: isRTL ? 'حظر المستخدمين ذوي السلوك المسيء' : 'Ban users with abusive behavior',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'fraud': return Shield;
      case 'spam': return AlertTriangle;
      case 'quality': return Flag;
      case 'behavior': return Ban;
      default: return Shield;
    }
  };

  const getRuleColor = (type: string) => {
    switch (type) {
      case 'fraud': return '#ef4444';
      case 'spam': return '#f59e0b';
      case 'quality': return '#3b82f6';
      case 'behavior': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const RuleCard = ({ rule }: { rule: Rule }) => {
    const Icon = getRuleIcon(rule.type);
    const color = getRuleColor(rule.type);

    return (
      <TouchableOpacity
        style={[styles.ruleCard, { backgroundColor: theme.card }]}
        onPress={() => {
          setSelectedRule(rule);
          setModalVisible(true);
        }}
      >
        <View style={styles.ruleHeader}>
          <View style={[styles.ruleIcon, { backgroundColor: color + '20' }]}>
            <Icon size={24} color={color} />
          </View>
          <View style={styles.ruleInfo}>
            <Text style={[styles.ruleTitle, { color: theme.text }]}>
              {isRTL ? rule.nameAr : rule.nameEn}
            </Text>
            <Text style={[styles.ruleDescription, { color: theme.secondaryText }]}>
              {rule.description}
            </Text>
          </View>
          <Switch
            value={rule.enabled}
            onValueChange={() => toggleRule(rule.id)}
            trackColor={{ false: theme.border, true: color }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.ruleDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'الإجراء' : 'Action'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {rule.action.charAt(0).toUpperCase() + rule.action.slice(1)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
              {isRTL ? 'العتبة' : 'Threshold'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {rule.threshold}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
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
            {isRTL ? 'القواعد التلقائية' : 'Automated Rules'}
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
          <Shield size={20} color={theme.primary} />
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            {isRTL 
              ? 'تساعد القواعد التلقائية في حماية المنصة من الاحتيال والسلوك المسيء'
              : 'Automated rules help protect the platform from fraud and abusive behavior'}
          </Text>
        </View>

        {rules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
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
                {isRTL ? 'تفاصيل القاعدة' : 'Rule Details'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedRule && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'النوع' : 'Type'}
                  </Text>
                  <Text style={[styles.value, { color: theme.secondaryText }]}>
                    {selectedRule.type.charAt(0).toUpperCase() + selectedRule.type.slice(1)}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'الإجراء' : 'Action'}
                  </Text>
                  <View style={styles.actionOptions}>
                    {['flag', 'review', 'suspend', 'ban'].map((action) => (
                      <TouchableOpacity
                        key={action}
                        style={[
                          styles.actionOption,
                          {
                            backgroundColor: selectedRule.action === action ? theme.primary + '20' : theme.background,
                            borderColor: selectedRule.action === action ? theme.primary : theme.border,
                          }
                        ]}
                        onPress={() => setSelectedRule({ ...selectedRule, action: action as any })}
                      >
                        <Text
                          style={[
                            styles.actionOptionText,
                            { color: selectedRule.action === action ? theme.primary : theme.text }
                          ]}
                        >
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: theme.text }]}>
                    {isRTL ? 'العتبة' : 'Threshold'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={selectedRule.threshold.toString()}
                    onChangeText={(text) => setSelectedRule({ ...selectedRule, threshold: parseInt(text) || 0 })}
                    keyboardType="numeric"
                    placeholderTextColor={theme.secondaryText}
                  />
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  if (selectedRule) {
                    setRules(rules.map(r => r.id === selectedRule.id ? selectedRule : r));
                  }
                  setModalVisible(false);
                }}
              >
                <Text style={styles.saveButtonText}>
                  {isRTL ? 'حفظ' : 'Save Changes'}
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
  ruleCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
  },
  ruleDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
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
  value: {
    fontSize: 16,
  },
  actionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
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
