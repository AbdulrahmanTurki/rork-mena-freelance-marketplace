import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user || user.type === "guest") {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        console.log("[Index] Checking if user is admin:", user.id);
        const { data: adminRole, error } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.log("[Index] No admin role found:", error.message);
          setIsAdmin(false);
        } else if (adminRole) {
          console.log("[Index] User is admin with role:", adminRole.role);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("[Index] Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  if (isLoading || checkingAdmin) {
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
  if (isAdmin) {
    console.log("[Index] User is admin, redirecting to admin panel");
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
