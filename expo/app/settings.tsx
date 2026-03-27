import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { Stack, useRouter } from "expo-router";
import {
  User,
  Lock,
  Bell,
  Mail,
  Globe,
  CreditCard,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function SettingsScreen() {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, isGuest, user } = useAuth();
  const router = useRouter();
  const { data: preferences, isLoading: loadingPreferences } = useUserPreferences(user?.id);
  const updatePreferences = useUpdateUserPreferences();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLanguageToggle = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              router.replace("/onboarding" as any);
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleGuestLogin = () => {
    router.push("/onboarding" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Account</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/edit-profile' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
                  <User size={20} color={BrandColors.primary} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Edit Profile</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/change-password' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FCE4EC" }]}>
                  <Lock size={20} color={BrandColors.accent} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Change Password</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
                  <Bell size={20} color="#9C27B0" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={preferences?.push_notifications ?? true}
                onValueChange={(value) => {
                  if (user?.id) {
                    updatePreferences.mutate({
                      userId: user.id,
                      updates: { push_notifications: value },
                    });
                  }
                }}
                trackColor={{
                  false: BrandColors.gray300,
                  true: BrandColors.primary,
                }}
                thumbColor={BrandColors.white}
                disabled={loadingPreferences || updatePreferences.isPending}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
                  <Mail size={20} color="#FF9800" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Email Notifications</Text>
              </View>
              <Switch
                value={preferences?.email_notifications ?? true}
                onValueChange={(value) => {
                  if (user?.id) {
                    updatePreferences.mutate({
                      userId: user.id,
                      updates: { email_notifications: value },
                    });
                  }
                }}
                trackColor={{
                  false: BrandColors.gray300,
                  true: BrandColors.primary,
                }}
                thumbColor={BrandColors.white}
                disabled={loadingPreferences || updatePreferences.isPending}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Order Updates</Text>
              </View>
              <Switch
                value={preferences?.order_updates ?? true}
                onValueChange={(value) => {
                  if (user?.id) {
                    updatePreferences.mutate({
                      userId: user.id,
                      updates: { order_updates: value },
                    });
                  }
                }}
                trackColor={{
                  false: BrandColors.gray300,
                  true: BrandColors.primary,
                }}
                thumbColor={BrandColors.white}
                disabled={loadingPreferences || updatePreferences.isPending}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Promotions & Offers</Text>
              </View>
              <Switch
                value={preferences?.promotions ?? false}
                onValueChange={(value) => {
                  if (user?.id) {
                    updatePreferences.mutate({
                      userId: user.id,
                      updates: { promotions: value },
                    });
                  }
                }}
                trackColor={{
                  false: BrandColors.gray300,
                  true: BrandColors.primary,
                }}
                thumbColor={BrandColors.white}
                disabled={loadingPreferences || updatePreferences.isPending}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? "#FFF9C4" : BrandColors.neutralDark + "15" }]}>
                  <Moon size={20} color={isDark ? "#F57C00" : BrandColors.neutralDark} />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: BrandColors.gray300,
                  true: BrandColors.primary,
                }}
                thumbColor={BrandColors.white}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLanguageToggle}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#E1F5FE" }]}>
                  <Globe size={20} color="#03A9F4" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Language</Text>
              </View>
              <View style={styles.languageBadge}>
                <Text style={styles.languageText}>
                  {language === "en" ? "English" : "العربية"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/payment-methods' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#F1F8E9" }]}>
                  <CreditCard size={20} color="#8BC34A" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Payment Methods</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Security & Privacy</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/privacy' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFEBEE" }]}>
                  <Shield size={20} color="#F44336" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Privacy Settings</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/two-factor' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
                  <Lock size={20} color="#FF9800" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Two-Factor Authentication</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Support</Text>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/help-center' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#E8EAF6" }]}>
                  <HelpCircle size={20} color="#3F51B5" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Help Center</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/terms' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
                  <FileText size={20} color="#9C27B0" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Terms & Conditions</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings/privacy-policy' as any)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#E0F2F1" }]}>
                  <FileText size={20} color="#009688" />
                </View>
                <Text style={[styles.menuItemText, { color: theme.text }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={BrandColors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {isGuest ? (
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: BrandColors.primary }]}
            onPress={handleGuestLogin}
          >
            <Text style={styles.loginButtonText}>Sign In / Sign Up</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.card, borderColor: BrandColors.error }]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={BrandColors.error} />
            ) : (
              <>
                <LogOut size={20} color={BrandColors.error} />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.gray600,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.gray200,
    marginLeft: 68,
  },
  languageBadge: {
    backgroundColor: BrandColors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BrandColors.white,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BrandColors.error,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.error,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  version: {
    fontSize: 13,
    color: BrandColors.gray400,
    textAlign: "center",
    marginBottom: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
