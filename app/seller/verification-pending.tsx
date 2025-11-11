import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { CheckCircle, Clock, Mail, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";

export default function VerificationPendingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  const { logout } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  const checkVerificationStatus = async () => {
    try {
      const storedSubmission = await AsyncStorage.getItem("verification_submission");
      if (storedSubmission) {
        const submission = JSON.parse(storedSubmission);
        
        if (submission.status === "approved") {
          router.replace("/seller/(tabs)/dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }
  };

  useEffect(() => {
    checkVerificationStatus();
    const interval = setInterval(checkVerificationStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handleRefresh = async () => {
    setIsChecking(true);
    await checkVerificationStatus();
    setTimeout(() => setIsChecking(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/onboarding");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: BrandColors.amber + "20",
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Clock size={64} color={BrandColors.amber} strokeWidth={2} />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            Verification in Progress
          </Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            Your account is currently being reviewed by our admin team. This
            usually takes 1-3 business days.
          </Text>
        </View>

        <View style={[styles.statusCard, { backgroundColor: theme.card }]}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: BrandColors.amber },
              ]}
            />
            <Text style={[styles.statusText, { color: theme.text }]}>
              Verification Pending
            </Text>
          </View>
          <Text style={[styles.statusSubtext, { color: theme.secondaryText }]}>
            We&apos;ve received your documents and our team is reviewing them
            carefully.
          </Text>
        </View>

        <View style={styles.infoCards}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: BrandColors.blue + "15" },
            ]}
          >
            <Mail size={24} color={BrandColors.blue} />
            <View style={styles.infoCardContent}>
              <Text style={[styles.infoCardTitle, { color: BrandColors.blue }]}>
                Email Notification
              </Text>
              <Text style={[styles.infoCardText, { color: BrandColors.blue }]}>
                You&apos;ll receive an email once your verification is complete
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: BrandColors.secondary + "15" },
            ]}
          >
            <CheckCircle size={24} color={BrandColors.secondary} />
            <View style={styles.infoCardContent}>
              <Text
                style={[
                  styles.infoCardTitle,
                  { color: BrandColors.secondary },
                ]}
              >
                What&apos;s Next?
              </Text>
              <Text
                style={[styles.infoCardText, { color: BrandColors.secondary }]}
              >
                Once approved, you can start creating gigs and earning money
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.refreshButton,
            isChecking && styles.refreshButtonDisabled,
          ]}
          onPress={handleRefresh}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color={BrandColors.white} />
          ) : (
            <>
              <RefreshCw size={20} color={BrandColors.white} />
              <Text style={styles.refreshButtonText}>Check Status</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800" as const,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500" as const,
  },
  statusCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
  statusSubtext: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 24,
  },
  infoCards: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: "row",
    padding: 18,
    borderRadius: 14,
    gap: 14,
    alignItems: "flex-start",
  },
  infoCardContent: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  infoCardText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
  },
});
