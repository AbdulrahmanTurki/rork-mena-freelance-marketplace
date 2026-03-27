import "react-native-gesture-handler"; // <--- THIS MUST BE THE FIRST LINE
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { EscrowProvider } from "@/contexts/EscrowContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TouchableOpacity, StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
        headerTintColor: theme.text,
        headerStyle: {
          backgroundColor: theme.headerBackground,
        },
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.card,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={theme.text} />
            </TouchableOpacity>
          ) : null,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="gig/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="freelancer/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="category/[id]"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="search"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen name="seller/(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="seller/verification-onboarding" options={{ headerShown: true, title: "Seller Verification" }} />
      <Stack.Screen name="seller/verification-pending" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

function NavigationWrapper() {
  return <RootLayoutNav />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <AdminProvider>
              <EscrowProvider>
                <GestureHandlerRootView style={styles.container}>
                  <NavigationWrapper />
                </GestureHandlerRootView>
              </EscrowProvider>
            </AdminProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
