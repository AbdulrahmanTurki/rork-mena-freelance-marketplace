import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Edit } from 'lucide-react-native';

export default function ContentManagementScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  const isRTL = language === 'ar';

  const pages = [
    { id: '1', title: isRTL ? 'الشروط والأحكام' : 'Terms & Conditions', lastEdited: '2024-03-10' },
    { id: '2', title: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy', lastEdited: '2024-03-08' },
    { id: '3', title: isRTL ? 'من نحن' : 'About Us', lastEdited: '2024-03-05' },
    { id: '4', title: isRTL ? 'مركز المساعدة' : 'Help Center', lastEdited: '2024-03-03' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'إدارة المحتوى' : 'Content Management',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <Text style={[styles.header, { color: theme.text }]}>
          {isRTL ? 'صفحات الموقع' : 'Site Pages'}
        </Text>
        {pages.map(page => (
          <TouchableOpacity
            key={page.id}
            style={[styles.pageCard, { backgroundColor: theme.card }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
              <FileText size={24} color={theme.primary} />
            </View>
            <View style={styles.pageInfo}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>{page.title}</Text>
              <Text style={[styles.pageDate, { color: theme.secondaryText }]}>
                {isRTL ? 'آخر تعديل:' : 'Last edited:'} {page.lastEdited}
              </Text>
            </View>
            <Edit size={20} color={theme.primary} />
          </TouchableOpacity>
        ))}
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
  },
  header: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginVertical: 16,
  },
  pageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pageInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  pageDate: {
    fontSize: 14,
  },
});
