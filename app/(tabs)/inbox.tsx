import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import React from "react";
import { useConversations } from "@/hooks/useMessages";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function InboxScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { data: conversationList = [], isLoading } = useConversations();

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

  const handleConversationPress = (conversation: typeof conversationList[0]) => {
    if (conversation.lastMessage?.order_id) {
      router.push(`/chat/${conversation.lastMessage.order_id}` as any);
    }
  };

  const renderConversation = ({ item }: { item: typeof conversationList[0] }) => {
    if (!item.otherUser || !item.lastMessage) return null;

    return (
      <TouchableOpacity
        style={[styles.conversationCard, { backgroundColor: theme.card }]}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.otherUser.avatar_url || "https://via.placeholder.com/150" }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.freelancerName, { color: theme.text }]}>
              {item.otherUser.full_name || "User"}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.lastMessage.created_at)}
            </Text>
          </View>
          <View style={styles.messagePreview}>
            <Text
              style={[
                styles.lastMessage,
                { color: theme.secondaryText },
                item.unreadCount > 0 && [styles.unreadMessage, { color: theme.text }],
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.message}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MessageCircle size={64} color={BrandColors.gray300} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {isLoading ? "Loading..." : t("noMessages")}
      </Text>
      {!isLoading && (
        <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>
          {t("startConversation")}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("messages"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <FlatList
        data={conversationList}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          conversationList.length === 0
            ? styles.emptyContainer
            : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
  },
  conversationCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: BrandColors.success,
    borderWidth: 2,
    borderColor: BrandColors.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  freelancerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  timestamp: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: BrandColors.gray600,
  },
  unreadMessage: {
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  unreadBadge: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BrandColors.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    color: BrandColors.gray500,
    textAlign: "center",
    lineHeight: 22,
  },
});
