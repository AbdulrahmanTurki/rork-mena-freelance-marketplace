import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthCallback() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("[AuthCallback] Processing OAuth callback");
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthCallback] Session error:", error);
          router.replace("/onboarding");
          return;
        }

        if (session) {
          console.log("[AuthCallback] Session found, redirecting to home");
          router.replace("/(tabs)/home");
        } else {
          console.log("[AuthCallback] No session found, redirecting to onboarding");
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error("[AuthCallback] Error handling callback:", error);
        router.replace("/onboarding");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ActivityIndicator size="large" color="#1dbf73" />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 16,
  },
  text: {
    fontSize: 16,
    color: "#62646a",
    fontWeight: "500" as const,
  },
});
