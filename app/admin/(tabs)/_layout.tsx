import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Platform, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react-native';

export default function AdminTabsLayout() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { adminUser } = useAdmin();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const isRTL = language === 'ar';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!adminUser) {
        console.log('[AdminTabs] No admin user, redirecting to login');
        router.replace('/admin/login');
      } else {
        console.log('[AdminTabs] Admin user found:', adminUser.email);
      }
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [adminUser, router]);

  if (isChecking) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!adminUser) {
    return null;
  }

  const t = {
    dashboard: isRTL ? 'لوحة التحكم' : 'Dashboard',
    users: isRTL ? 'المستخدمين' : 'Users',
    gigs: isRTL ? 'الخدمات' : 'Gigs',
    disputes: isRTL ? 'النزاعات' : 'Disputes',
    more: isRTL ? 'المزيد' : 'More',
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t.dashboard,
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: t.users,
          tabBarIcon: ({ color, size }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: t.gigs,
          tabBarIcon: ({ color, size }) => <Briefcase size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="disputes"
        options={{
          title: t.disputes,
          tabBarIcon: ({ color, size }) => <AlertCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.more,
          tabBarIcon: ({ color, size }) => <MoreHorizontal size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
