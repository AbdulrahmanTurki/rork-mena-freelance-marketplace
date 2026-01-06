import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { useAuth } from "@/contexts/AuthContext";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type OrderRevision = Database["public"]["Tables"]["order_revisions"]["Row"];

export interface OrderWithDetails extends Order {
  gig?: {
    id: string;
    title: string;
    images: string[] | null;
  };
  buyer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  seller?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  revisions?: OrderRevision[];
}

export function useOrders(params?: {
  buyerId?: string;
  sellerId?: string;
  status?: Order["status"];
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", params, user?.id],
    queryFn: async () => {
      console.log("Fetching orders from Supabase...", params);
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          gig:gigs(id, title, images),
          buyer:profiles!buyer_id(id, full_name, avatar_url),
          seller:profiles!seller_id(id, full_name, avatar_url),
          revisions:order_revisions(*)
        `
        );

      if (params?.buyerId) {
        query = query.eq("buyer_id", params.buyerId);
      } else if (params?.sellerId) {
        query = query.eq("seller_id", params.sellerId);
      } else if (user?.id) {
        query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      }

      if (params?.status) {
        query = query.eq("status", params.status);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to fetch orders: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`);
      }

      console.log(`Fetched ${data?.length || 0} orders`);
      return data as OrderWithDetails[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      console.log(`Fetching order ${id} from Supabase...`);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          gig:gigs(id, title, images, description),
          buyer:profiles!buyer_id(id, full_name, avatar_url, email),
          seller:profiles!seller_id(id, full_name, avatar_url, email),
          revisions:order_revisions(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order:", {
          orderId: id,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        throw new Error(`Failed to fetch order: ${error.message}${error.details ? ` (${error.details})` : ''}`);
      }

      if (!data) {
        console.error("Order not found:", id);
        throw new Error("Order not found");
      }

      console.log("Fetched order:", data);
      return data as OrderWithDetails;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: OrderInsert) => {
      console.log("Creating order:", order);
      const { data, error } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error);
        throw error;
      }

      console.log("Order created:", data);
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OrderUpdate }) => {
      console.log(`Updating order ${id}:`, updates);
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      console.log("Order updated:", data);
      return data as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
    },
  });
}

export function useRequestRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      requestMessage,
      revisionNumber,
    }: {
      orderId: string;
      requestMessage: string;
      revisionNumber: number;
    }) => {
      console.log(`Requesting revision for order ${orderId}`);

      const { data, error } = await supabase
        .from("order_revisions")
        .insert({
          order_id: orderId,
          revision_number: revisionNumber,
          request_message: requestMessage,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error requesting revision:", error);
        throw error;
      }

      await supabase
        .from("orders")
        .update({ status: "revision_requested" })
        .eq("id", orderId);

      console.log("Revision requested:", data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.orderId] });
    },
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      deliveryFiles,
    }: {
      orderId: string;
      deliveryFiles: string[];
    }) => {
      console.log(`Delivering order ${orderId}`);

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivery_files: deliveryFiles,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error delivering order:", error);
        throw error;
      }

      console.log("Order delivered:", data);
      return data as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
    },
  });
}

export function useCompleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log(`Completing order ${orderId}`);

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("Error completing order:", error);
        throw error;
      }

      console.log("Order completed:", data);
      return data as Order;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", data.id] });
    },
  });
}
