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
        console.log("[Index] Checking if user is admin via RPC:", user.id);
        // UPDATED: Use RPC instead of direct select
        const { data: adminRole, error } = await supabase.rpc('get_my_admin_role');

        if (error) {
          console.log("[Index] RPC check failed or not admin:", error.message);
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

  console.log("[Index] Regular user check...");

  if (user.type === "seller") {
    if (user.verificationStatus === "approved") {
      return <Redirect href="/seller/(tabs)/dashboard" />;
    } else if (user.verificationStatus === "pending" || user.verificationStatus === "rejected") {
      return <Redirect href="/seller/verification-pending" />;
    } else {
      return <Redirect href="/seller/verification-onboarding" />;
    }
  }

  return <Redirect href="/(tabs)/home" />;
}
