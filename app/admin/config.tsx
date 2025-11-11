import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react-native';

type ConfigItem = {
  key: string;
  nameEn: string;
  nameAr: string;
  value: string | boolean;
  type: 'text' | 'toggle' | 'number';
  description: string;
};

export default function AppConfigScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';

  const [config, setConfig] = useState<ConfigItem[]>([
    {
      key: 'maintenance_mode',
      nameEn: 'Maintenance Mode',
      nameAr: 'وضع الصيانة',
      value: false,
      type: 'toggle',
      description: isRTL ? 'تعطيل المنصة للصيانة' : 'Disable platform for maintenance',
    },
    {
      key: 'allow_registrations',
      nameEn: 'Allow Registrations',
      nameAr: 'السماح بالتسجيل',
      value: true,
      type: 'toggle',
      description: isRTL ? 'السماح للمستخدمين الجدد بالتسجيل' : 'Allow new users to register',
    },
    {
      key: 'min_withdrawal_amount',
      nameEn: 'Min Withdrawal Amount',
      nameAr: 'الحد الأدنى للسحب',
      value: '50',
      type: 'number',
      description: isRTL ? 'الحد الأدنى لمبلغ السحب' : 'Minimum amount for withdrawal',
    },
    {
      key: 'max_gig_price',
      nameEn: 'Max Gig Price',
      nameAr: 'أقصى سعر للخدمة',
      value: '5000',
      type: 'number',
      description: isRTL ? 'الحد الأقصى لسعر الخدمة' : 'Maximum price for a gig',
    },
    {
      key: 'support_email',
      nameEn: 'Support Email',
      nameAr: 'بريد الدعم',
      value: 'support@khedmah.com',
      type: 'text',
      description: isRTL ? 'البريد الإلكتروني للدعم' : 'Support email address',
    },
    {
      key: 'featured_gig_enabled',
      nameEn: 'Featured Gigs',
      nameAr: 'الخدمات المميزة',
      value: true,
      type: 'toggle',
      description: isRTL ? 'السماح بإبراز الخدمات' : 'Allow gigs to be featured',
    },
  ]);

  const updateConfig = (key: string, value: string | boolean) => {
    setConfig(config.map(item => item.key === key ? { ...item, value } : item));
  };

  const ConfigCard = ({ item }: { item: ConfigItem }) => (
    <View style={[styles.configCard, { backgroundColor: theme.card }]}>
      <View style={styles.configHeader}>
        <View style={styles.configInfo}>
          <Text style={[styles.configName, { color: theme.text }]}>
            {isRTL ? item.nameAr : item.nameEn}
          </Text>
          <Text style={[styles.configDesc, { color: theme.secondaryText }]}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.configValue}>
        {item.type === 'toggle' ? (
          <Switch
            value={item.value as boolean}
            onValueChange={(value) => updateConfig(item.key, value)}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        ) : (
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
            value={item.value.toString()}
            onChangeText={(text) => updateConfig(item.key, text)}
            keyboardType={item.type === 'number' ? 'numeric' : 'default'}
            placeholderTextColor={theme.secondaryText}
          />
        )}
      </View>
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
            {isRTL ? 'إعدادات التطبيق' : 'App Configuration'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.warningCard, { backgroundColor: '#fef3c7' }]}>
          <AlertCircle size={20} color="#f59e0b" />
          <Text style={[styles.warningText, { color: '#92400e' }]}>
            {isRTL 
              ? 'كن حذرًا عند تغيير هذه الإعدادات - قد تؤثر على تجربة المستخدم'
              : 'Be careful when changing these settings - they may affect user experience'}
          </Text>
        </View>

        {config.map((item) => (
          <ConfigCard key={item.key} item={item} />
        ))}

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
        >
          <Settings size={20} color="#fff" />
          <Text style={styles.saveButtonText}>
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  configCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  configHeader: {
    marginBottom: 12,
  },
  configInfo: {
    flex: 1,
  },
  configName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  configDesc: {
    fontSize: 14,
  },
  configValue: {
    alignItems: 'flex-start',
  },
  input: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
