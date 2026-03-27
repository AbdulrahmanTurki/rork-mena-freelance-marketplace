import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
type PaymentMethodInsert = Database["public"]["Tables"]["payment_methods"]["Insert"];
type PaymentMethodUpdate = Database["public"]["Tables"]["payment_methods"]["Update"];

export function usePaymentMethods(userId: string | undefined) {
  return useQuery({
    queryKey: ["payment_methods", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      console.log(`[usePaymentMethods] Fetching payment methods for user ${userId}`);
      
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[usePaymentMethods] Error fetching payment methods:", error);
        throw error;
      }

      console.log(`[usePaymentMethods] Fetched ${data.length} payment methods`);
      return data as PaymentMethod[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethod: PaymentMethodInsert) => {
      console.log("[useAddPaymentMethod] Adding payment method:", paymentMethod);
      
      if (paymentMethod.is_default) {
        const { error: updateError } = await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", paymentMethod.user_id);

        if (updateError) {
          console.error("[useAddPaymentMethod] Error updating existing default:", updateError);
        }
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .insert(paymentMethod)
        .select()
        .single();

      if (error) {
        console.error("[useAddPaymentMethod] Error adding payment method:", error);
        throw error;
      }

      console.log("[useAddPaymentMethod] Payment method added:", data);
      return data as PaymentMethod;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods", data.user_id] });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      userId,
      updates,
    }: {
      id: string;
      userId: string;
      updates: PaymentMethodUpdate;
    }) => {
      console.log(`[useUpdatePaymentMethod] Updating payment method ${id}:`, updates);
      
      if (updates.is_default) {
        const { error: updateError } = await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("user_id", userId);

        if (updateError) {
          console.error("[useUpdatePaymentMethod] Error updating existing default:", updateError);
        }
      }

      const { data, error } = await supabase
        .from("payment_methods")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[useUpdatePaymentMethod] Error updating payment method:", error);
        throw error;
      }

      console.log("[useUpdatePaymentMethod] Payment method updated:", data);
      return data as PaymentMethod;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods", data.user_id] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      console.log(`[useDeletePaymentMethod] Deleting payment method ${id}`);
      
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[useDeletePaymentMethod] Error deleting payment method:", error);
        throw error;
      }

      console.log("[useDeletePaymentMethod] Payment method deleted");
      return { id, userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payment_methods", data.userId] });
    },
  });
}
