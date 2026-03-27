import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings as SettingsIcon, Users, Shield, Globe, Moon } from 'lucide-react-native';
import { useState } from 'react';

export default function AdminSettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { adminUser } = useAdmin();
  const insets = useSafeAreaInsets();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const isRTL = language === 'ar';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'الإعدادات' : 'Settings',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'الحساب' : 'Account'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Users size={20} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isRTL ? 'الدور' : 'Role'}
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.secondaryText }]}>
              {adminUser?.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'الأمان' : 'Security'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Shield size={20} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isRTL ? 'المصادقة الثنائية' : 'Two-Factor Auth'}
              </Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{ false: '#767577', true: theme.primary + '80' }}
              thumbColor={twoFactorEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'المظهر' : 'Appearance'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isRTL ? 'الوضع الداكن' : 'Dark Mode'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary + '80' }}
              thumbColor={isDark ? theme.primary : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Globe size={20} color={theme.primary} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isRTL ? 'اللغة' : 'Language'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => changeLanguage(language === 'en' ? 'ar' : 'en')}>
              <Text style={[styles.settingValue, { color: theme.primary }]}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isRTL ? 'إشعارات البريد' : 'Email Notifications'}
              </Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#767577', true: theme.primary + '80' }}
              thumbColor={emailNotifications ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
});
