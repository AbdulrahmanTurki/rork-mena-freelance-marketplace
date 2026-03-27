import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, DollarSign, Shield, AlertTriangle, CheckCircle, Save } from 'lucide-react-native';

export default function EscrowSettingsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();

  const [autoReleaseDays, setAutoReleaseDays] = useState<string>('7');
  const [disputeTimeLimit, setDisputeTimeLimit] = useState<string>('14');
  const [minEscrowAmount, setMinEscrowAmount] = useState<string>('50');
  const [maxEscrowAmount, setMaxEscrowAmount] = useState<string>('50000');
  const [enableAutoRelease, setEnableAutoRelease] = useState<boolean>(true);
  const [requireBuyerApproval, setRequireBuyerApproval] = useState<boolean>(true);
  const [enableInstantRelease, setEnableInstantRelease] = useState<boolean>(false);
  const [freezeOnDispute, setFreezeOnDispute] = useState<boolean>(true);
  const [notifyOnRelease, setNotifyOnRelease] = useState<boolean>(true);
  const [notifyOnDispute, setNotifyOnDispute] = useState<boolean>(true);

  const texts = {
    en: {
      title: 'Escrow Settings',
      generalSettings: 'General Settings',
      autoReleaseDays: 'Auto-Release Days',
      autoReleaseDaysDesc: 'Days after delivery before automatic release',
      disputeTimeLimit: 'Dispute Time Limit',
      disputeTimeLimitDesc: 'Days buyer has to open a dispute',
      minAmount: 'Minimum Escrow Amount',
      minAmountDesc: 'Minimum amount that can be held in escrow',
      maxAmount: 'Maximum Escrow Amount',
      maxAmountDesc: 'Maximum amount that can be held in escrow',
      enableAutoRelease: 'Enable Auto-Release',
      enableAutoReleaseDesc: 'Automatically release funds after delivery period',
      requireBuyerApproval: 'Require Buyer Approval',
      requireBuyerApprovalDesc: 'Buyer must approve before release',
      enableInstantRelease: 'Enable Instant Release',
      enableInstantReleaseDesc: 'Allow sellers to request instant release',
      freezeOnDispute: 'Freeze on Dispute',
      freezeOnDisputeDesc: 'Freeze funds when dispute is opened',
      notifications: 'Notifications',
      notifyOnRelease: 'Notify on Release',
      notifyOnReleaseDesc: 'Send notifications when funds are released',
      notifyOnDispute: 'Notify on Dispute',
      notifyOnDisputeDesc: 'Send notifications when dispute is opened',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully',
      sar: 'SAR',
      days: 'days',
    },
    ar: {
      title: 'إعدادات الضمان المالي',
      generalSettings: 'الإعدادات العامة',
      autoReleaseDays: 'أيام التحرير التلقائي',
      autoReleaseDaysDesc: 'الأيام بعد التسليم قبل التحرير التلقائي',
      disputeTimeLimit: 'الحد الزمني للمنازعة',
      disputeTimeLimitDesc: 'الأيام المتاحة للمشتري لفتح منازعة',
      minAmount: 'الحد الأدنى لمبلغ الضمان',
      minAmountDesc: 'الحد الأدنى للمبلغ الذي يمكن حجزه',
      maxAmount: 'الحد الأقصى لمبلغ الضمان',
      maxAmountDesc: 'الحد الأقصى للمبلغ الذي يمكن حجزه',
      enableAutoRelease: 'تفعيل التحرير التلقائي',
      enableAutoReleaseDesc: 'تحرير الأموال تلقائياً بعد فترة التسليم',
      requireBuyerApproval: 'يتطلب موافقة المشتري',
      requireBuyerApprovalDesc: 'يجب على المشتري الموافقة قبل التحرير',
      enableInstantRelease: 'تفعيل التحرير الفوري',
      enableInstantReleaseDesc: 'السماح للبائعين بطلب التحرير الفوري',
      freezeOnDispute: 'التجميد عند المنازعة',
      freezeOnDisputeDesc: 'تجميد الأموال عند فتح منازعة',
      notifications: 'الإشعارات',
      notifyOnRelease: 'الإشعار عند التحرير',
      notifyOnReleaseDesc: 'إرسال إشعارات عند تحرير الأموال',
      notifyOnDispute: 'الإشعار عند المنازعة',
      notifyOnDisputeDesc: 'إرسال إشعارات عند فتح منازعة',
      saveSettings: 'حفظ الإعدادات',
      settingsSaved: 'تم حفظ الإعدادات بنجاح',
      sar: 'ريال',
      days: 'أيام',
    },
  };

  const t = texts[language];

  const handleSave = () => {
    console.log('Saving escrow settings:', {
      autoReleaseDays,
      disputeTimeLimit,
      minEscrowAmount,
      maxEscrowAmount,
      enableAutoRelease,
      requireBuyerApproval,
      enableInstantRelease,
      freezeOnDispute,
      notifyOnRelease,
      notifyOnDispute,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t.title,
          headerStyle: { backgroundColor: theme.card },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.generalSettings}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Clock size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.autoReleaseDays}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.autoReleaseDaysDesc}
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={autoReleaseDays}
                onChangeText={setAutoReleaseDays}
                keyboardType="number-pad"
                placeholder="7"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={[styles.inputSuffix, { color: theme.secondaryText }]}>
                {t.days}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <AlertTriangle size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.disputeTimeLimit}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.disputeTimeLimitDesc}
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={disputeTimeLimit}
                onChangeText={setDisputeTimeLimit}
                keyboardType="number-pad"
                placeholder="14"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={[styles.inputSuffix, { color: theme.secondaryText }]}>
                {t.days}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <DollarSign size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.minAmount}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.minAmountDesc}
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={minEscrowAmount}
                onChangeText={setMinEscrowAmount}
                keyboardType="number-pad"
                placeholder="50"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={[styles.inputSuffix, { color: theme.secondaryText }]}>
                {t.sar}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <DollarSign size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.maxAmount}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.maxAmountDesc}
                </Text>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={maxEscrowAmount}
                onChangeText={setMaxEscrowAmount}
                keyboardType="number-pad"
                placeholder="50000"
                placeholderTextColor={theme.secondaryText}
              />
              <Text style={[styles.inputSuffix, { color: theme.secondaryText }]}>
                {t.sar}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <CheckCircle size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.enableAutoRelease}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.enableAutoReleaseDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={enableAutoRelease}
              onValueChange={setEnableAutoRelease}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <CheckCircle size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.requireBuyerApproval}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.requireBuyerApprovalDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={requireBuyerApproval}
              onValueChange={setRequireBuyerApproval}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <CheckCircle size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.enableInstantRelease}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.enableInstantReleaseDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={enableInstantRelease}
              onValueChange={setEnableInstantRelease}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <AlertTriangle size={18} color={theme.secondaryText} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.freezeOnDispute}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.freezeOnDisputeDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={freezeOnDispute}
              onValueChange={setFreezeOnDispute}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {t.notifications}
            </Text>
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.notifyOnRelease}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.notifyOnReleaseDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={notifyOnRelease}
              onValueChange={setNotifyOnRelease}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.toggleItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.notifyOnDispute}
                </Text>
                <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>
                  {t.notifyOnDisputeDesc}
                </Text>
              </View>
            </View>
            <Switch
              value={notifyOnDispute}
              onValueChange={setNotifyOnDispute}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{t.saveSettings}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600' as const,
    minWidth: 60,
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
