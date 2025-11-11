import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

type Message = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export interface MessageWithSender extends Message {
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
}

export function useMessages(orderId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", orderId, user?.id],
    queryFn: async () => {
      console.log("Fetching messages from Supabase...", orderId);
      let queryBuilder = supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!sender_id(id, full_name, avatar_url),
          receiver:profiles!receiver_id(id, full_name, avatar_url)
        `
        );

      if (orderId) {
        queryBuilder = queryBuilder.eq("order_id", orderId);
      } else if (user?.id) {
        queryBuilder = queryBuilder.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
      }

      queryBuilder = queryBuilder.order("created_at", { ascending: true });

      const { data, error } = await queryBuilder;

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} messages`);
      return data as MessageWithSender[];
    },
    enabled: !!user,
    staleTime: 0,
  });

  useEffect(() => {
    if (!orderId || !user) return;

    console.log("Setting up real-time subscription for messages:", orderId);

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          queryClient.invalidateQueries({ queryKey: ["messages", orderId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Message updated:", payload);
          queryClient.invalidateQueries({ queryKey: ["messages", orderId] });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription for messages");
      supabase.removeChannel(channel);
    };
  }, [orderId, user, queryClient]);

  return query;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      console.log("Fetching conversations from Supabase...");
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:profiles!sender_id(id, full_name, avatar_url),
          receiver:profiles!receiver_id(id, full_name, avatar_url)
        `
        )
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }

      const conversationsMap = new Map<string, Conversation>();

      data.forEach((message: any) => {
        const otherUserId =
          message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const otherUser =
          message.sender_id === user.id ? message.receiver : message.sender;

        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            id: otherUserId,
            otherUser,
            lastMessage: message,
            unreadCount: 0,
          });
        }

        if (!message.is_read && message.receiver_id === user.id) {
          const conversation = conversationsMap.get(otherUserId)!;
          conversation.unreadCount++;
        }
      });

      const conversations = Array.from(conversationsMap.values());
      console.log(`Found ${conversations.length} conversations`);
      return conversations;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: MessageInsert) => {
      console.log("Sending message:", message);
      const { data, error } = await supabase
        .from("messages")
        .insert(message)
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }

      console.log("Message sent:", data);
      return data as Message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      console.log(`Marking message ${messageId} as read`);
      const { data, error } = await supabase
        .from("messages")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", messageId)
        .select()
        .single();

      if (error) {
        console.error("Error marking message as read:", error);
        throw error;
      }

      console.log("Message marked as read:", data);
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkAllMessagesAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log(`Marking all messages as read for order ${orderId}`);
      const { data, error } = await supabase
        .from("messages")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .eq("receiver_id", user?.id || "")
        .select();

      if (error) {
        console.error("Error marking messages as read:", error);
        throw error;
      }

      console.log(`Marked ${data?.length || 0} messages as read`);
      return data as Message[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
