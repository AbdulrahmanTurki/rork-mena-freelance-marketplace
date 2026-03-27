import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Package, ShoppingBag, MessageCircle, CheckCircle, X } from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'order' | 'message' | 'gig' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';
  
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: isRTL ? 'طلب جديد' : 'New Order',
      message: isRTL ? 'لديك طلب جديد من أحمد محمد' : 'You have a new order from Ahmed Mohammed',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '2',
      type: 'message',
      title: isRTL ? 'رسالة جديدة' : 'New Message',
      message: isRTL ? 'رسالة جديدة في الطلب #12345' : 'New message in order #12345',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '3',
      type: 'system',
      title: isRTL ? 'تحديث النظام' : 'System Update',
      message: isRTL ? 'تم تحديث الشروط والأحكام' : 'Terms and conditions have been updated',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={20} color={theme.primary} />;
      case 'message':
        return <MessageCircle size={20} color={theme.primary} />;
      case 'gig':
        return <Package size={20} color={theme.primary} />;
      default:
        return <Bell size={20} color={theme.primary} />;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isRTL ? 'الآن' : 'Now';
    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadCount, { color: theme.secondaryText }]}>
                {unreadCount} {isRTL ? 'جديد' : 'new'}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                <CheckCircle size={20} color={theme.primary} />
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearAll} style={styles.headerButton}>
                <X size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={theme.tertiaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.secondaryText }]}>
              {isRTL ? 'سنعلمك عند وجود أي تحديثات' : "We'll notify you when something happens"}
            </Text>
          </View>
        ) : (
          notifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                {
                  backgroundColor: notification.isRead ? theme.card : theme.primary + '10',
                  borderColor: notification.isRead ? 'transparent' : theme.primary + '20',
                },
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                {getNotificationIcon(notification.type)}
              </View>
              <View style={styles.notificationContent}>
                <Text style={[styles.notificationTitle, { color: theme.text }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationMessage, { color: theme.secondaryText }]} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={[styles.notificationTime, { color: theme.tertiaryText }]}>
                  {formatTime(notification.createdAt)}
                </Text>
              </View>
              {!notification.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
            </TouchableOpacity>
          ))
        )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  unreadCount: {
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    marginTop: 8,
  },
});
