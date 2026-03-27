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
      // 1. If not logged in, stop checking
      if (!user || user.type === "guest") {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        console.log("[Index] Checking admin status via RPC...");
        // 2. USE THE NEW SECURE FUNCTION (Fixes the redirect loop)
        const { data: adminRole, error } = await supabase.rpc('get_my_admin_role');

        if (adminRole) {
          console.log("[Index] Admin confirmed:", adminRole.role);
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("[Index] Error checking admin:", error);
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
        <ActivityIndicator size="large" color="#1DBF73" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  // 3. Redirect based on status
  if (isAdmin) {
    return <Redirect href="/admin/(tabs)/dashboard" />;
  }

  if (user.type === "seller") {
    if (user.verificationStatus === "approved") {
      return <Redirect href="/seller/(tabs)/dashboard" />;
    } else if (user.verificationStatus === "pending") {
      return <Redirect href="/seller/verification-pending" />;
    } else {
      return <Redirect href="/seller/verification-onboarding" />;
    }
  }

  return <Redirect href="/(tabs)/home" />;
}
