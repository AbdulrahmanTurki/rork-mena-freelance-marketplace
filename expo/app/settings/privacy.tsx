import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { Shield, Eye, EyeOff, Lock, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
} from "react-native";

export default function PrivacySettingsScreen() {
  const { theme } = useTheme();

  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showActivity: true,
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Privacy Settings",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Shield size={24} color={BrandColors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Your Privacy</Text>
            <Text style={[styles.infoText, { color: theme.secondaryText }]}>
              Control who can see your information and activity on the platform.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            Activity Status
          </Text>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.success + "15" }]}>
                <Eye size={20} color={BrandColors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Show Online Status
                </Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Let others see when you're online
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(value) =>
                setSettings({ ...settings, showOnlineStatus: value })
              }
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.showOnlineStatus ? BrandColors.primary : BrandColors.white}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + "15" }]}>
                <Eye size={20} color={BrandColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Show Last Seen</Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Display when you were last active
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showLastSeen}
              onValueChange={(value) => setSettings({ ...settings, showLastSeen: value })}
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.showLastSeen ? BrandColors.primary : BrandColors.white}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.accent + "15" }]}>
                <Eye size={20} color={BrandColors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Show Activity</Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Display your recent activity
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showActivity}
              onValueChange={(value) => setSettings({ ...settings, showActivity: value })}
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.showActivity ? BrandColors.primary : BrandColors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            Profile Visibility
          </Text>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.secondary + "15" }]}>
                <Users size={20} color={BrandColors.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Public Profile
                </Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Make your profile visible to everyone
                </Text>
              </View>
            </View>
            <Switch
              value={settings.profileVisibility}
              onValueChange={(value) =>
                setSettings({ ...settings, profileVisibility: value })
              }
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.profileVisibility ? BrandColors.primary : BrandColors.white}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#FF9800" + "15" }]}>
                <EyeOff size={20} color="#FF9800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Show Email</Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Display email on your profile
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showEmail}
              onValueChange={(value) => setSettings({ ...settings, showEmail: value })}
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.showEmail ? BrandColors.primary : BrandColors.white}
            />
          </View>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#4CAF50" + "15" }]}>
                <EyeOff size={20} color="#4CAF50" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>Show Phone</Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Display phone number on your profile
                </Text>
              </View>
            </View>
            <Switch
              value={settings.showPhone}
              onValueChange={(value) => setSettings({ ...settings, showPhone: value })}
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.showPhone ? BrandColors.primary : BrandColors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Messages</Text>

          <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: BrandColors.primary + "15" }]}>
                <Lock size={20} color={BrandColors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Allow Messages
                </Text>
                <Text style={[styles.settingDescription, { color: theme.tertiaryText }]}>
                  Let anyone send you messages
                </Text>
              </View>
            </View>
            <Switch
              value={settings.allowMessages}
              onValueChange={(value) =>
                setSettings({ ...settings, allowMessages: value })
              }
              trackColor={{
                false: BrandColors.gray300,
                true: BrandColors.primary + "60",
              }}
              thumbColor={settings.allowMessages ? BrandColors.primary : BrandColors.white}
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
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
    padding: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 12,
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
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 40,
  },
});
