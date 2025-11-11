import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_preferences", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      console.log(`[useUserPreferences] Fetching preferences for user ${userId}`);
      
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("[useUserPreferences] No preferences found, creating default");
          const { data: newData, error: insertError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: userId,
              push_notifications: true,
              email_notifications: true,
              order_updates: true,
              promotions: false,
              show_online_status: true,
              show_last_seen: true,
              profile_visibility: true,
              show_email: false,
              show_phone: false,
              allow_messages: true,
              show_activity: true,
            })
            .select()
            .single();

          if (insertError) {
            console.error("[useUserPreferences] Error creating preferences:", insertError);
            throw insertError;
          }

          return newData as UserPreferences;
        }
        
        console.error("[useUserPreferences] Error fetching preferences:", error);
        throw error;
      }

      console.log("[useUserPreferences] Preferences fetched:", data);
      return data as UserPreferences;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: UserPreferencesUpdate;
    }) => {
      console.log(`[useUpdateUserPreferences] Updating preferences for user ${userId}:`, updates);
      
      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("[useUpdateUserPreferences] Error updating preferences:", error);
        throw error;
      }

      console.log("[useUpdateUserPreferences] Preferences updated:", data);
      return data as UserPreferences;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_preferences", data.user_id] });
    },
  });
}
