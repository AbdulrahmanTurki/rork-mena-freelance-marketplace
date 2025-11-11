import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { Shield, Smartphone, Mail, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function TwoFactorAuthScreen() {
  const { theme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [method, setMethod] = useState<"sms" | "email">("sms");

  const handleEnable = () => {
    Alert.alert(
      "Enable 2FA",
      `Two-factor authentication will be enabled via ${method === "sms" ? "SMS" : "Email"}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Enable",
          onPress: () => {
            setIsEnabled(true);
            Alert.alert("Success", "Two-factor authentication has been enabled!");
          },
        },
      ]
    );
  };

  const handleDisable = () => {
    Alert.alert(
      "Disable 2FA",
      "Are you sure you want to disable two-factor authentication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            setIsEnabled(false);
            Alert.alert("Disabled", "Two-factor authentication has been disabled");
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Two-Factor Authentication",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: isEnabled ? BrandColors.success + "15" : theme.card }]}>
          <Shield size={32} color={isEnabled ? BrandColors.success : BrandColors.gray400} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: theme.text }]}>
              Two-Factor Authentication
            </Text>
            <Text style={[styles.statusText, { color: theme.secondaryText }]}>
              {isEnabled ? "Enabled and protecting your account" : "Not enabled"}
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            What is Two-Factor Authentication?
          </Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Two-factor authentication adds an extra layer of security to your account. When
            enabled, you'll need to enter a code sent to your phone or email in addition to
            your password when signing in.
          </Text>
        </View>

        {!isEnabled && (
          <View style={styles.methodSection}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
              Choose Authentication Method
            </Text>

            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor: theme.card,
                  borderColor: method === "sms" ? BrandColors.primary : theme.border,
                },
              ]}
              onPress={() => setMethod("sms")}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                  <Smartphone size={24} color={BrandColors.primary} />
                </View>
                <View>
                  <Text style={[styles.methodTitle, { color: theme.text }]}>
                    SMS Verification
                  </Text>
                  <Text style={[styles.methodDescription, { color: theme.tertiaryText }]}>
                    Receive codes via text message
                  </Text>
                </View>
              </View>
              {method === "sms" && (
                <View style={[styles.checkmark, { backgroundColor: BrandColors.primary }]}>
                  <Check size={16} color={BrandColors.white} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodCard,
                {
                  backgroundColor: theme.card,
                  borderColor: method === "email" ? BrandColors.primary : theme.border,
                },
              ]}
              onPress={() => setMethod("email")}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.methodIcon, { backgroundColor: BrandColors.secondary + "15" }]}>
                  <Mail size={24} color={BrandColors.secondary} />
                </View>
                <View>
                  <Text style={[styles.methodTitle, { color: theme.text }]}>
                    Email Verification
                  </Text>
                  <Text style={[styles.methodDescription, { color: theme.tertiaryText }]}>
                    Receive codes via email
                  </Text>
                </View>
              </View>
              {method === "email" && (
                <View style={[styles.checkmark, { backgroundColor: BrandColors.primary }]}>
                  <Check size={16} color={BrandColors.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isEnabled && (
          <View style={[styles.activeCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.activeTitle, { color: theme.text }]}>Active Method</Text>
            <View style={styles.activeMethod}>
              <View style={[styles.methodIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                {method === "sms" ? (
                  <Smartphone size={24} color={BrandColors.primary} />
                ) : (
                  <Mail size={24} color={BrandColors.primary} />
                )}
              </View>
              <View>
                <Text style={[styles.methodTitle, { color: theme.text }]}>
                  {method === "sms" ? "SMS Verification" : "Email Verification"}
                </Text>
                <Text style={[styles.methodDescription, { color: theme.tertiaryText }]}>
                  {method === "sms"
                    ? "Codes sent to +966 •••• 4567"
                    : "Codes sent to j•••@example.com"}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isEnabled ? BrandColors.error + "15" : BrandColors.primary,
              borderColor: isEnabled ? BrandColors.error : "transparent",
            },
          ]}
          onPress={isEnabled ? handleDisable : handleEnable}
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: isEnabled ? BrandColors.error : BrandColors.white },
            ]}
          >
            {isEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
          </Text>
        </TouchableOpacity>

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
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  methodSection: {
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
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  activeTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  activeMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  bottomPadding: {
    height: 40,
  },
});
