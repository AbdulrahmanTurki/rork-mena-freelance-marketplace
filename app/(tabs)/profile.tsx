import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { Settings, User, Store, Package, TrendingUp } from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, isGuest, refreshUser } = useAuth();
  const router = useRouter();
  const [isCheckingVerification, setIsCheckingVerification] = React.useState(false);

  const handleBecomeSeller = async () => {
    if (isGuest) {
      router.push("/onboarding" as any);
      return;
    }

    if (!user) return;

    if (user.type === "seller") {
      const status = user.verificationStatus;
      if (status === "approved") {
        router.push("/seller/(tabs)/dashboard" as any);
      } else if (status === "pending") {
        router.push("/seller/verification-pending" as any);
      } else {
        router.push("/seller/verification-onboarding" as any);
      }
      return;
    }

    setIsCheckingVerification(true);
    try {
      const { data: existingVerification } = await supabase
        .from("seller_verifications")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (existingVerification) {
        const { error } = await supabase
          .from("profiles")
          .update({ user_type: "seller" })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating user type:", error);
          Alert.alert("Error", "Failed to update your account. Please try again.");
          return;
        }

        await refreshUser(user.id, user.email);

        if (existingVerification.status === "approved") {
          router.push("/seller/(tabs)/dashboard" as any);
        } else if (existingVerification.status === "pending") {
          router.push("/seller/verification-pending" as any);
        } else {
          Alert.alert(
            "Verification Required",
            "Your previous verification was rejected. Please contact support or submit a new application."
          );
        }
      } else {
        Alert.alert(
          "Become a Seller",
          "To sell on Khedmah, you need to complete the seller verification process. This includes identity verification and freelance permit validation.",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Start Verification",
              onPress: async () => {
                const { error } = await supabase
                  .from("profiles")
                  .update({ user_type: "seller" })
                  .eq("id", user.id);

                if (error) {
                  console.error("Error updating user type:", error);
                  Alert.alert("Error", "Failed to update your account. Please try again.");
                  return;
                }

                await refreshUser(user.id, user.email);
                router.push("/seller/verification-onboarding" as any);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      Alert.alert("Error", "Failed to check verification status. Please try again.");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("profile"),
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.card }]}>
            <User size={48} color={BrandColors.gray400} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name || t("guestUser")}</Text>
          <Text style={[styles.email, { color: theme.secondaryText }]}>
            {isGuest ? t("signInToAccessProfile") : user?.email}
          </Text>
        </View>

        {isGuest && (
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push("/onboarding" as any)}
          >
            <Text style={styles.buttonText}>{t("signInSignUp")}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("sellerDashboard")}</Text>
          <TouchableOpacity
            style={styles.sellerCard}
            onPress={handleBecomeSeller}
            disabled={isCheckingVerification}
          >
            <View style={styles.sellerCardIcon}>
              {isCheckingVerification ? (
                <ActivityIndicator size="small" color={BrandColors.white} />
              ) : (
                <Store size={24} color={BrandColors.white} />
              )}
            </View>
            <View style={styles.sellerCardInfo}>
              <Text style={styles.sellerCardTitle}>
                {user?.type === "seller" ? t("sellerDashboardLabel") : t("switchToSelling")}
              </Text>
              <Text style={styles.sellerCardDesc}>
                {user?.type === "seller" 
                  ? user.verificationStatus === "approved"
                    ? t("manageYourServicesDesc")
                    : user.verificationStatus === "pending"
                    ? t("verificationPending")
                    : t("completeVerification")
                  : t("manageYourServices")}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.quickLinksGrid}>
            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/gigs" as any)}
            >
              <View
                style={[styles.quickLinkIcon, { backgroundColor: "#E8F5E9" }]}
              >
                <Package size={20} color={BrandColors.primary} />
              </View>
              <Text style={[styles.quickLinkText, { color: theme.text }]}>{t("myGigs")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/analytics" as any)}
            >
              <View
                style={[styles.quickLinkIcon, { backgroundColor: "#FCE4EC" }]}
              >
                <TrendingUp size={20} color={BrandColors.accent} />
              </View>
              <Text style={[styles.quickLinkText, { color: theme.text }]}>{t("analytics")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings")}</Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.card }]}
            onPress={() => router.push("/settings" as any)}
          >
            <Settings size={20} color={BrandColors.gray600} />
            <Text style={[styles.menuItemText, { color: theme.text }]}>{t("accountSettings")}</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  button: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: BrandColors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: BrandColors.neutralDark,
  },
  sellerCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  sellerCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerCardInfo: {
    flex: 1,
  },
  sellerCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.white,
    marginBottom: 4,
  },
  sellerCardDesc: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "rgba(255, 255, 255, 0.9)",
  },
  quickLinksGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickLinkCard: {
    flex: 1,
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickLinkText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    textAlign: "center",
  },
});
