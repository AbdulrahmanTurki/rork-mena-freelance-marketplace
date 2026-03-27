import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { Lock, Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function ChangePasswordScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to change your password");
      return;
    }

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) {
        console.error("Password change error:", error);
        Alert.alert("Error", error.message || "Failed to change password. Please try again.");
        return;
      }

      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Password change exception:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Change Password",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Lock size={24} color={BrandColors.primary} />
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Your password must be at least 8 characters long and include a mix of letters,
            numbers, and symbols.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                value={formData.currentPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, currentPassword: text })
                }
                placeholder="Enter current password"
                placeholderTextColor={theme.tertiaryText}
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
              >
                {showPasswords.current ? (
                  <Eye size={20} color={theme.tertiaryText} />
                ) : (
                  <EyeOff size={20} color={theme.tertiaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Enter new password"
                placeholderTextColor={theme.tertiaryText}
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
              >
                {showPasswords.new ? (
                  <Eye size={20} color={theme.tertiaryText} />
                ) : (
                  <EyeOff size={20} color={theme.tertiaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Confirm new password"
                placeholderTextColor={theme.tertiaryText}
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
              >
                {showPasswords.confirm ? (
                  <Eye size={20} color={theme.tertiaryText} />
                ) : (
                  <EyeOff size={20} color={theme.tertiaryText} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: BrandColors.primary }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={BrandColors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotButton}>
          <Text style={[styles.forgotButtonText, { color: BrandColors.primary }]}>
            Forgot your current password?
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 15,
    borderWidth: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 15,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  forgotButton: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  bottomPadding: {
    height: 40,
  },
});
