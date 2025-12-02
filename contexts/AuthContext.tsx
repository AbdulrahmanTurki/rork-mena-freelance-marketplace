import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, checkSignupRateLimit, recordSignupAttempt, clearSignupAttempts, testSupabaseConnection } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type UserType = "buyer" | "seller" | "guest" | null;

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  avatar?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  profile?: Profile;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      console.log("[AuthContext] Loading profile for user:", userId);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("[AuthContext] Error loading profile:", profileError);
        
        if (profileError.message?.includes('FetchError') ||
            profileError.message?.includes('Network request failed')) {
          console.error('[AuthContext] Network error loading profile');
        }
        
        return;
      }

      console.log("[AuthContext] Profile loaded, user_type:", profile.user_type);

      let verificationStatus: "pending" | "approved" | "rejected" | undefined =
        undefined;

      if (profile.user_type === "seller") {
        console.log("[AuthContext] User is seller, checking verification status");
        const { data: verification, error: verError } = await supabase
          .from("seller_verifications")
          .select("status")
          .eq("user_id", userId)
          .single();

        if (verError && !verError.message.includes('No rows')) {
          console.error('[AuthContext] Error loading verification:', verError);
        }

        verificationStatus = verification?.status;
        console.log("[AuthContext] Verification status:", verificationStatus);
      }

      const userData: User = {
        id: userId,
        email: profile.email,
        name: profile.full_name || email.split("@")[0],
        type: profile.user_type,
        avatar: profile.avatar_url || undefined,
        verificationStatus,
        profile,
      };

      console.log("[AuthContext] Setting user state:", {
        type: userData.type,
        verificationStatus: userData.verificationStatus,
      });
      setUser(userData);
    } catch (error) {
      console.error("[AuthContext] Error in loadUserProfile:", error);
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email || "");
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      
      if (error instanceof Error && 
          (error.message.includes('Network request failed') ||
           error.message.includes('Failed to fetch'))) {
        console.error('[AuthContext] Network error during initial load. Supabase might be unreachable.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  useEffect(() => {
    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || "");
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadUser, loadUserProfile]);



  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: string }> => {
      try {
        console.log('[AuthContext] Starting login...');
        
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest.success) {
          console.error('[AuthContext] Connection test failed:', connectionTest.error);
          return { 
            error: 'Unable to connect to server. Please check your internet connection and try again.'
          };
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error("Login error:", error);
          
          if (error.message?.includes('Network request failed') || 
              error.message?.includes('Failed to fetch') ||
              error.name === 'AuthRetryableFetchError') {
            return { 
              error: 'Network error. Please check your internet connection and try again.'
            };
          }
          
          return { error: error.message };
        }

        if (data.user) {
          await loadUserProfile(data.user.id, data.user.email || "");
        }

        return {};
      } catch (error) {
        console.error("Login exception:", error);
        
        if (error instanceof Error && 
            (error.message.includes('Network request failed') ||
             error.message.includes('Failed to fetch') ||
             error.message.includes('fetch'))) {
          return { 
            error: 'Network error. Please check your internet connection. Your Supabase instance might be paused or unreachable.'
          };
        }
        
        return { error: "An unexpected error occurred" };
      }
    },
    [loadUserProfile]
  );

  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      type: UserType
    ): Promise<{ error?: string }> => {
      try {
        console.log("[AuthContext] Starting signup for type:", type);
        
        const rateLimit = await checkSignupRateLimit();
        if (!rateLimit.allowed && rateLimit.waitTimeMs) {
          const waitMinutes = Math.ceil(rateLimit.waitTimeMs / 60000);
          return {
            error: `Too many signup attempts. Please wait ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''} before trying again.`
          };
        }
        
        await recordSignupAttempt();
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) {
          console.error("[AuthContext] Signup error:", error);
          console.error("[AuthContext] Error name:", error.name);
          console.error("[AuthContext] Error message:", error.message);
          console.error("[AuthContext] Error status:", error.status);
          console.error("[AuthContext] Full error object:", JSON.stringify(error, null, 2));
          
          if (error.message?.includes('rate limit') || error.message?.includes('email rate limit')) {
            return { 
              error: 'Too many signup attempts from this email. Please wait 5 minutes and try again, or use a different email address.' 
            };
          }
          
          return { error: error.message };
        }

        if (data.user) {
          console.log("[AuthContext] User created:", data.user.id);
          
          // Wait for trigger to complete
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Check if profile was created by trigger
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, user_type")
            .eq("id", data.user.id)
            .single();

          if (profileError || !profile) {
            console.error("[AuthContext] Profile not found, creating manually:", profileError);
            if (profileError) {
              console.error("[AuthContext] Profile error details:", JSON.stringify(profileError, null, 2));
            }
            
            // Create profile manually if trigger failed
            const { error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: data.user.id,
                email,
                full_name: name,
                user_type: type || "buyer",
              });

            if (insertError && !insertError.message.includes('duplicate key')) {
              console.error("[AuthContext] Profile insert error:", insertError);
              console.error("[AuthContext] Insert error details:", JSON.stringify(insertError, null, 2));
              return { error: "Failed to create profile. Please contact support or try again." };
            }
          }

          // Update user_type if needed (trigger always creates as buyer)
          if (type === "seller") {
            console.log("[AuthContext] Updating profile to seller type");
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                full_name: name,
                user_type: "seller",
              })
              .eq("id", data.user.id);

            if (updateError) {
              console.error("[AuthContext] Profile update error:", updateError);
              console.error("[AuthContext] Update error details:", JSON.stringify(updateError, null, 2));
            }
          }

          console.log("[AuthContext] Profile setup complete");

          // Load the profile
          await loadUserProfile(data.user.id, data.user.email || "");
          console.log("[AuthContext] Profile loaded, user state updated");
          
          await clearSignupAttempts();
        }

        return {};
      } catch (error) {
        console.error("[AuthContext] Signup exception:", error);
        if (error instanceof Error) {
          console.error("[AuthContext] Error message:", error.message);
          console.error("[AuthContext] Error stack:", error.stack);
        }
        return { error: "An unexpected error occurred. Check console for details." };
      }
    },
    [loadUserProfile]
  );

  const continueAsGuest = useCallback(async () => {
    const guestUser: User = {
      id: "guest_" + Math.random().toString(36).substring(7),
      email: "",
      name: "Guest User",
      type: "guest",
    };
    setUser(guestUser);
  }, []);

  const switchToSeller = useCallback(async () => {
    if (!user || user.type === "guest") return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_type: "seller" })
        .eq("id", user.id);

      if (error) {
        console.error("Error switching to seller:", error);
        return;
      }

      await loadUserProfile(user.id, user.email);
    } catch (error) {
      console.error("Exception in switchToSeller:", error);
    }
  }, [user, loadUserProfile]);

  const switchToBuyer = useCallback(async () => {
    if (!user || user.type === "guest") return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_type: "buyer" })
        .eq("id", user.id);

      if (error) {
        console.error("Error switching to buyer:", error);
        return;
      }

      await loadUserProfile(user.id, user.email);
    } catch (error) {
      console.error("Exception in switchToBuyer:", error);
    }
  }, [user, loadUserProfile]);

  const signInWithGoogle = useCallback(async (): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'zjfw89icva7ii8uq7vuhe://auth/callback',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        return { error: error.message };
      }

      console.log("Google OAuth URL:", data.url);
      return {};
    } catch (error) {
      console.error("Google sign-in exception:", error);
      return { error: "An unexpected error occurred" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const isGuest = useMemo(() => user?.type === "guest", [user]);
  const isSeller = useMemo(() => user?.type === "seller", [user]);
  const isAuthenticated = useMemo(() => !!user && user.type !== "guest", [user]);

  return useMemo(
    () => ({
      user,
      isLoading,
      isGuest,
      isSeller,
      isAuthenticated,
      login,
      signup,
      signInWithGoogle,
      continueAsGuest,
      switchToSeller,
      switchToBuyer,
      logout,
      refreshUser: loadUserProfile,
    }),
    [
      user,
      isLoading,
      isGuest,
      isSeller,
      isAuthenticated,
      login,
      signup,
      signInWithGoogle,
      continueAsGuest,
      switchToSeller,
      switchToBuyer,
      logout,
      loadUserProfile,
    ]
  );
});
