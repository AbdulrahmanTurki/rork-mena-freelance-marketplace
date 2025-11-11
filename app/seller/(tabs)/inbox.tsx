import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Search, MessageCircle } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { useConversations } from "@/hooks/useMessages";
import { useOrders } from "@/hooks/useOrders";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SellerInbox() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: conversationList = [], isLoading } = useConversations();
  const { data: orders = [] } = useOrders();

  const filteredConversations = useMemo(() => {
    return conversationList.filter((conv) =>
      conv.otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversationList, searchQuery]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("inbox"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.searchContainer, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={BrandColors.gray500} strokeWidth={2.5} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t("searchConversations")}
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            if (!conversation.otherUser || !conversation.lastMessage) return null;
            
            const hasOrder = orders.some(
              (order) => order.id === conversation.lastMessage?.order_id
            );

            return (
              <TouchableOpacity
                key={conversation.id}
                style={[styles.conversationCard, { backgroundColor: theme.card }]}
                onPress={() => {
                  if (conversation.lastMessage?.order_id) {
                    router.push(`/seller/chat/${conversation.lastMessage.order_id}` as any);
                  }
                }}
              >
                <Image
                  source={{
                    uri: conversation.otherUser.avatar_url || "https://via.placeholder.com/150",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={[styles.buyerName, { color: theme.text }]}>
                      {conversation.otherUser.full_name || "User"}
                    </Text>
                    <Text style={[styles.timestamp, { color: theme.tertiaryText }]}>
                      {formatTime(conversation.lastMessage.created_at)}
                    </Text>
                  </View>
                  <View style={styles.messageRow}>
                    <Text
                      style={[
                        styles.lastMessage,
                        {
                          color:
                            conversation.unreadCount > 0
                              ? theme.text
                              : theme.secondaryText,
                        },
                        conversation.unreadCount > 0 && styles.unreadMessage,
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage.message}
                    </Text>
                    {conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>
                          {conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {hasOrder && (
                    <View style={styles.orderTag}>
                      <MessageCircle size={12} color={BrandColors.primary} />
                      <Text style={styles.orderTagText}>{t("active Order")}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle
              size={64}
              color={BrandColors.gray300}
              strokeWidth={1.5}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {isLoading ? "Loading..." : t("noConversations")}
            </Text>
            {!isLoading && (
              <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>
                {t("conversationsWillAppear")}
              </Text>
            )}
          </View>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  searchContainer: {
    backgroundColor: BrandColors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.neutralLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  scrollView: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: BrandColors.gray600,
  },
  unreadMessage: {
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  unreadBadge: {
    backgroundColor: BrandColors.accent,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: "900" as const,
    color: BrandColors.white,
  },
  orderTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "15",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
  },
  orderTagText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: BrandColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: BrandColors.gray600,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
