import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Camera, Globe } from "lucide-react-native";
import React, { useState, useEffect } from "react";
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

export default function EditProfileScreen() {
  const { t, language, changeLanguage } = useLanguage();
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { data: profile, isLoading, error: profileError } = useProfile(user?.id || "");
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    title: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.mobile_number || "",
        city: profile.city || "",
        title: profile.title || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleLanguageToggle = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to update your profile");
      return;
    }

    if (!formData.fullName.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          full_name: formData.fullName.trim(),
          mobile_number: formData.phone.trim() || null,
          city: formData.city.trim() || null,
          title: formData.title.trim() || null,
          bio: formData.bio.trim() || null,
        },
      });

      await refreshUser(user.id, user.email);

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("edit Profile"),
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
              Loading profile...
            </Text>
          </View>
        ) : profileError ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.errorText, { color: BrandColors.error }]}>
              Error loading profile
            </Text>
            <Text style={[styles.errorSubText, { color: theme.secondaryText }]}>
              {profileError?.message || "Failed to load profile data"}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: BrandColors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.profileImageSection}>
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri:
                      profile?.avatar_url ||
                      "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(formData.fullName || "User") +
                        "&size=200&background=0D8ABC&color=fff",
                  }}
                  style={styles.profileImage}
                />
                <TouchableOpacity style={styles.cameraButton}>
                  <Camera size={20} color={BrandColors.white} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.imageHint, { color: theme.secondaryText }]}>
                Upload a professional photo
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Basic Information
              </Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Full Name *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.tertiaryText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Email *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.email}
                  editable={false}
                  placeholder="your.email@example.com"
                  placeholderTextColor={theme.tertiaryText}
                />
                <Text style={[styles.helperText, { color: theme.tertiaryText }]}>
                  Email cannot be changed
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="+966 50 123 4567"
                  placeholderTextColor={theme.tertiaryText}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Professional Title
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  placeholder="e.g., Senior Graphic Designer"
                  placeholderTextColor={theme.tertiaryText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bio: text })
                  }
                  placeholder="Tell clients about yourself and your expertise..."
                  placeholderTextColor={theme.tertiaryText}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>City</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.card,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  value={formData.city}
                  onChangeText={(text) =>
                    setFormData({ ...formData, city: text })
                  }
                  placeholder="City, Country"
                  placeholderTextColor={theme.tertiaryText}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: BrandColors.primary }]}
              onPress={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator size="small" color={BrandColors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        )}

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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  profileImageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: BrandColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: BrandColors.white,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  imageHint: {
    fontSize: 13,
    color: BrandColors.gray500,
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: BrandColors.neutralDark,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 12,
    color: BrandColors.gray500,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: BrandColors.white,
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
