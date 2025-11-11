import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Send, Users, User } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'buyers' | 'sellers'>('all');

  const isRTL = language === 'ar';

  const handleSend = () => {
    console.log('Sending notification:', { title, message, target });
    setTitle('');
    setMessage('');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? 'الإشعارات' : 'Notifications',
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.iconHeader}>
            <Bell size={32} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {isRTL ? 'إرسال إشعار' : 'Send Notification'}
            </Text>
          </View>

          <Text style={[styles.label, { color: theme.text }]}>
            {isRTL ? 'العنوان' : 'Title'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder={isRTL ? 'عنوان الإشعار' : 'Notification title'}
            placeholderTextColor={theme.tertiaryText}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            {isRTL ? 'الرسالة' : 'Message'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder={isRTL ? 'رسالة الإشعار' : 'Notification message'}
            placeholderTextColor={theme.tertiaryText}
            value={message}
            onChangeText={setMessage}
            multiline
          />

          <Text style={[styles.label, { color: theme.text }]}>
            {isRTL ? 'الجمهور المستهدف' : 'Target Audience'}
          </Text>
          <View style={styles.targetButtons}>
            <TouchableOpacity
              style={[styles.targetButton, { backgroundColor: target === 'all' ? theme.primary : theme.inputBackground }]}
              onPress={() => setTarget('all')}
            >
              <Users size={20} color={target === 'all' ? '#fff' : theme.text} />
              <Text style={[styles.targetText, { color: target === 'all' ? '#fff' : theme.text }]}>
                {isRTL ? 'الجميع' : 'All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.targetButton, { backgroundColor: target === 'buyers' ? theme.primary : theme.inputBackground }]}
              onPress={() => setTarget('buyers')}
            >
              <User size={20} color={target === 'buyers' ? '#fff' : theme.text} />
              <Text style={[styles.targetText, { color: target === 'buyers' ? '#fff' : theme.text }]}>
                {isRTL ? 'المشترين' : 'Buyers'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.targetButton, { backgroundColor: target === 'sellers' ? theme.primary : theme.inputBackground }]}
              onPress={() => setTarget('sellers')}
            >
              <User size={20} color={target === 'sellers' ? '#fff' : theme.text} />
              <Text style={[styles.targetText, { color: target === 'sellers' ? '#fff' : theme.text }]}>
                {isRTL ? 'البائعين' : 'Sellers'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.primary, opacity: title && message ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!title || !message}
          >
            <Send size={20} color="#fff" />
            <Text style={styles.sendButtonText}>
              {isRTL ? 'إرسال الإشعار' : 'Send Notification'}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  targetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  targetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  targetText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
