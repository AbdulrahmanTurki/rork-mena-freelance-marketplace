import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { useAuth } from "@/contexts/AuthContext";

type SellerWallet = Database["public"]["Tables"]["seller_wallets"]["Row"];
type WithdrawalRequest = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
type Transaction = Database["public"]["Tables"]["transactions"]["Row"];

export interface WalletWithDetails extends SellerWallet {
  pending_withdrawals?: WithdrawalRequest[];
  recent_transactions?: Transaction[];
}

export function useSellerWallet(sellerId?: string) {
  const { user } = useAuth();
  const effectiveSellerId = sellerId || user?.id;

  return useQuery({
    queryKey: ["seller_wallet", effectiveSellerId],
    queryFn: async () => {
      console.log(`[useSellerWallet] Fetching wallet for seller: ${effectiveSellerId}`);
      if (!effectiveSellerId) {
        console.warn("[useSellerWallet] No seller ID provided");
        return null;
      }

      const { data, error } = await supabase
        .from("seller_wallets")
        .select("*")
        .eq("seller_id", effectiveSellerId)
        .maybeSingle();

      if (error) {
        console.error("[useSellerWallet] Error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(error.message || "Failed to fetch seller wallet");
      }

      if (!data) {
        console.log("[useSellerWallet] No wallet found for seller, returning null");
        return null;
      }

      console.log("[useSellerWallet] Wallet found:", {
        id: data.id,
        seller_id: data.seller_id,
        available_balance: data.available_balance,
        total_earned: data.total_earned,
      });
      return data as WalletWithDetails;
    },
    enabled: !!effectiveSellerId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useWithdrawalRequests(sellerId?: string) {
  const { user } = useAuth();
  const effectiveSellerId = sellerId || user?.id;

  return useQuery({
    queryKey: ["withdrawal_requests", effectiveSellerId],
    queryFn: async () => {
      console.log(`Fetching withdrawal requests for ${effectiveSellerId}`);
      if (!effectiveSellerId) throw new Error("No seller ID provided");

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("seller_id", effectiveSellerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching withdrawal requests:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} withdrawal requests`);
      return data as WithdrawalRequest[];
    },
    enabled: !!effectiveSellerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTransactions(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ["transactions", effectiveUserId],
    queryFn: async () => {
      console.log(`Fetching transactions for ${effectiveUserId}`);
      if (!effectiveUserId) throw new Error("No user ID provided");

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          from_user:profiles!from_user_id(id, full_name),
          to_user:profiles!to_user_id(id, full_name),
          order:orders(id, order_number, gig_title)
        `
        )
        .or(`from_user_id.eq.${effectiveUserId},to_user_id.eq.${effectiveUserId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} transactions`);
      return data as any[];
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateWithdrawalRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      amount,
      payoutMethod,
      payoutDetails,
    }: {
      amount: number;
      payoutMethod: string;
      payoutDetails: any;
    }) => {
      console.log("Creating withdrawal request:", { amount, payoutMethod });
      if (!user?.id) throw new Error("User not authenticated");

      const { data: wallet, error: walletError } = await supabase
        .from("seller_wallets")
        .select("id")
        .eq("seller_id", user.id)
        .single();

      if (walletError) {
        console.error("Error fetching wallet:", walletError);
        throw walletError;
      }

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .insert({
          seller_id: user.id,
          wallet_id: wallet.id,
          amount,
          payout_method: payoutMethod,
          payout_details: payoutDetails,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating withdrawal request:", error);
        throw error;
      }

      console.log("Withdrawal request created:", data);
      return data as WithdrawalRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller_wallet"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal_requests"] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      availableBalance,
      pendingBalance,
      totalEarned,
    }: {
      sellerId: string;
      availableBalance?: number;
      pendingBalance?: number;
      totalEarned?: number;
    }) => {
      console.log(`Updating wallet for ${sellerId}`);

      const updates: any = {};
      if (availableBalance !== undefined) updates.available_balance = availableBalance;
      if (pendingBalance !== undefined) updates.pending_balance = pendingBalance;
      if (totalEarned !== undefined) updates.total_earned = totalEarned;

      const { data, error } = await supabase
        .from("seller_wallets")
        .update(updates)
        .eq("seller_id", sellerId)
        .select()
        .single();

      if (error) {
        console.error("Error updating wallet:", error);
        throw error;
      }

      console.log("Wallet updated:", data);
      return data as SellerWallet;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["seller_wallet", data.seller_id] });
    },
  });
}

export function useProcessWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      withdrawalId,
      status,
      declineReason,
    }: {
      withdrawalId: string;
      status: "approved" | "declined" | "completed";
      declineReason?: string;
    }) => {
      console.log(`Processing withdrawal ${withdrawalId} with status: ${status}`);

      const updates: any = {
        status,
        processed_at: new Date().toISOString(),
        processed_by: user?.id,
      };

      if (declineReason) {
        updates.decline_reason = declineReason;
      }

      const { data, error } = await supabase
        .from("withdrawal_requests")
        .update(updates)
        .eq("id", withdrawalId)
        .select()
        .single();

      if (error) {
        console.error("Error processing withdrawal:", error);
        throw error;
      }

      console.log("Withdrawal processed:", data);
      return data as WithdrawalRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal_requests"] });
      queryClient.invalidateQueries({ queryKey: ["seller_wallet"] });
    },
  });
}
