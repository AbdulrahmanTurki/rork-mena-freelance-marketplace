import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, checkSignupRateLimit, recordSignupAttempt, clearSignupAttempts } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

export type UserType = "buyer" | "seller" | "admin" | "guest" | null;

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
      
      // First check if user is an admin
      console.log("[AuthContext] Checking for admin role...");
      const { data: adminRole, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log("[AuthContext] Admin role query result:", { adminRole, adminError });
      
      if (!adminError && adminRole) {
        console.log("[AuthContext] ✅ User is an admin:", adminRole.role);
        const userData: User = {
          id: userId,
          email: email,
          name: email.split("@")[0],
          type: "admin",
        };
        console.log("[AuthContext] Setting admin user state:", JSON.stringify(userData, null, 2));
        setUser(userData);
        console.log("[AuthContext] ✅ Admin user state SET! Returning now.");
        return;
      } else if (adminError) {
        console.log("[AuthContext] ⚠️ Error checking admin role:", adminError);
      } else {
        console.log("[AuthContext] ℹ️ No admin role found for user");
      }
      
      console.log("[AuthContext] Not an admin, loading regular profile...");
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
      console.log('[AuthContext] Starting initial user load...');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 5000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

      if (session?.user) {
        console.log('[AuthContext] Session found, loading profile...');
        await loadUserProfile(session.user.id, session.user.email || "");
      } else {
        console.log('[AuthContext] No active session');
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load user:", error);
      
      if (error instanceof Error && 
          (error.message.includes('Network request failed') ||
           error.message.includes('Failed to fetch') ||
           error.message.includes('timeout'))) {
        console.warn('[AuthContext] Network error during initial load. Continuing without authentication. Supabase might be paused or unreachable.');
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
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        );
        
        const loginPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

        if (error) {
          console.error("Login error:", error);
          
          if (error.message?.includes('Network request failed') || 
              error.message?.includes('Failed to fetch') ||
              error.name === 'AuthRetryableFetchError') {
            return { 
              error: 'Unable to connect to server. Please check your internet connection. The database might be paused.'
            };
          }
          
          return { error: error.message };
        }

        if (data.user) {
          console.log('[AuthContext] Login successful, loading user profile...');
          await loadUserProfile(data.user.id, data.user.email || "");
          console.log('[AuthContext] User profile loaded after login');
        }

        return {};
      } catch (error) {
        console.error("Login exception:", error);
        
        if (error instanceof Error && 
            (error.message.includes('Network request failed') ||
             error.message.includes('Failed to fetch') ||
             error.message.includes('timeout') ||
             error.message.includes('fetch'))) {
          return { 
            error: 'Unable to reach server. Your Supabase database might be paused or unreachable. Please check the Supabase dashboard.'
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
