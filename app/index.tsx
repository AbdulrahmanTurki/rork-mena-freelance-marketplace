import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  console.log("[Index] ==========================");
  console.log("[Index] isLoading:", isLoading);
  console.log("[Index] user:", JSON.stringify(user, null, 2));
  console.log("[Index] user?.type:", user?.type);
  console.log("[Index] ==========================");

  if (isLoading) {
    console.log("[Index] Still loading, showing spinner");
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    console.log("[Index] No user, redirecting to onboarding");
    return <Redirect href="/onboarding" />;
  }

  // Check if user is an admin first
  if (user.type === "admin") {
    console.log("[Index] ✅ User is admin, redirecting to admin panel");
    return <Redirect href="/admin/(tabs)/dashboard" />;
  }

  console.log("[Index] Full user object:", JSON.stringify(user, null, 2));
  console.log("[Index] User type:", user.type, "Verification status:", user.verificationStatus);

  if (user.type === "seller") {
    console.log("[Index] User is seller, checking verification status...");
    if (user.verificationStatus === "approved") {
      console.log("[Index] Seller approved, redirecting to dashboard");
      return <Redirect href="/seller/(tabs)/dashboard" />;
    } else if (user.verificationStatus === "pending" || user.verificationStatus === "rejected") {
      console.log("[Index] Seller verification pending/rejected, redirecting to pending page");
      return <Redirect href="/seller/verification-pending" />;
    } else {
      console.log("[Index] Seller needs verification (status is undefined), redirecting to onboarding");
      return <Redirect href="/seller/verification-onboarding" />;
    }
  }

  console.log("[Index] Regular user, redirecting to home");
  return <Redirect href="/(tabs)/home" />;
}
