import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useUserPreferences, useUpdateUserPreferences } from "@/hooks/useUserPreferences";
import { Stack, useRouter } from "expo-router";
import {
  Globe,
  CreditCard,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Shield,
  Eye,
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
  const { t, language, changeLanguage } = useLanguage();
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const router = useRouter();
  const { data: preferences, isLoading: loadingPreferences } = useUserPreferences(user?.id);
  const updatePreferences = useUpdateUserPreferences();

  const handleLanguageToggle = () => {
    changeLanguage(language === "en" ? "ar" : "en");
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
            await logout();
            router.replace("/onboarding" as any);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("settings"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={styles.languageButton}
              onPress={handleLanguageToggle}
            >
              <Globe size={20} color={BrandColors.primary} />
              <Text style={styles.languageText}>
                {language === "en" ? "AR" : "EN"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Account</Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: theme.card }]}
            onPress={() => router.push("/seller/edit-profile" as any)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + "15" }]}>
                <Eye size={20} color={BrandColors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>


        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Notifications</Text>

          {loadingPreferences ? (
            <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={BrandColors.primary} />
            </View>
          ) : (
            <>
          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Order Updates</Text>
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
                true: BrandColors.primary + "60",
              }}
              thumbColor={
                (preferences?.order_updates ?? true) ? BrandColors.primary : BrandColors.white
              }
              disabled={updatePreferences.isPending}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Email Notifications</Text>
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
                true: BrandColors.primary + "60",
              }}
              thumbColor={
                (preferences?.email_notifications ?? true) ? BrandColors.primary : BrandColors.white
              }
              disabled={updatePreferences.isPending}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Promotions</Text>
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
                true: BrandColors.primary + "60",
              }}
              thumbColor={
                (preferences?.promotions ?? false) ? BrandColors.primary : BrandColors.white
              }
              disabled={updatePreferences.isPending}
            />
          </View>
            </>
          )}
        </View>



        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Preferences</Text>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.neutralDark + "15" }]}>
                <Moon size={20} color={BrandColors.neutralDark} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={
                isDark ? BrandColors.primary : BrandColors.white
              }
            />
          </View>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={handleLanguageToggle}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + "15" }]}>
                <Globe size={20} color={BrandColors.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Language</Text>
                <Text style={[styles.settingValue, { color: theme.tertiaryText }]}>
                  {language === "en" ? "English" : "العربية"}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Earnings & Payout</Text>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={() => router.push('/seller/earnings' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.success + "15" }]}>
                <CreditCard size={20} color={BrandColors.success} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Earnings</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={() => router.push('/settings/payment-methods' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.secondary + "15" }]}>
                <CreditCard size={20} color={BrandColors.secondary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Payout Methods</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Support</Text>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={() => router.push('/settings/help-center' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + "15" }]}>
                <HelpCircle size={20} color={BrandColors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Help Center</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={() => router.push('/settings/terms' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.secondary + "15" }]}>
                <FileText size={20} color={BrandColors.secondary} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Terms & Conditions</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.card }]} onPress={() => router.push('/settings/privacy-policy' as any)}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.accent + "15" }]}>
                <Shield size={20} color={BrandColors.accent} />
              </View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={BrandColors.gray400} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={BrandColors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.tertiaryText }]}>Version 1.0.0</Text>

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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: BrandColors.gray600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  settingLeft: {
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
  settingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  settingValue: {
    fontSize: 13,
    color: BrandColors.gray500,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BrandColors.error + "10",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: BrandColors.error + "30",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.error,
  },
  versionText: {
    fontSize: 13,
    color: BrandColors.gray400,
    textAlign: "center",
    marginTop: 20,
  },
  bottomPadding: {
    height: 40,
  },
  languageButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BrandColors.gray100,
    borderRadius: 20,
    marginRight: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
});
