import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Send, Paperclip } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDirectMessages, useSendDirectMessage } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DirectChatScreen() {
  const { id } = useLocalSearchParams<{ id: string; gigId?: string }>();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [], isLoading: messagesLoading } = useDirectMessages(id as string);
  const { data: profiles = [] } = useProfiles();
  const sendMessageMutation = useSendDirectMessage();

  const otherUser = profiles.find((p) => p.id === id);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (messageText.trim() === "" || !user?.id || !id || isGuest) return;

    const messageContent = messageText.trim();
    setMessageText("");

    try {
      await sendMessageMutation.mutateAsync({
        sender_id: user.id,
        receiver_id: id as string,
        message: messageContent,
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("[handleSend] Error:", error);
      setMessageText(messageContent);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: typeof messages[0] }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        {!isMe && otherUser && (
          <Image
            source={{ uri: otherUser.avatar_url || "https://via.placeholder.com/150" }}
            style={styles.messageAvatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : { backgroundColor: theme.card, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : { color: theme.text },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMe ? styles.myMessageTime : { color: theme.secondaryText },
            ]}
          >
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (messagesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: "Chat", headerStyle: { backgroundColor: theme.headerBackground }, headerTintColor: theme.text }} />
        <View style={styles.centerContainer}>
          <Text style={[styles.centerText, { color: theme.secondaryText }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!otherUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: "Chat", headerStyle: { backgroundColor: theme.headerBackground }, headerTintColor: theme.text }} />
        <View style={styles.centerContainer}>
          <Text style={[styles.centerText, { color: theme.secondaryText }]}>User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: otherUser.full_name || "Chat",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerRight: () => (
            <View style={styles.headerRight}>
              <Image
                source={{ uri: otherUser.avatar_url || "https://via.placeholder.com/150" }}
                style={styles.headerAvatar}
              />
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Start a conversation
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>
              Send a message to {otherUser.full_name || 'the seller'}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity style={[styles.attachButton, { backgroundColor: theme.inputBackground }]}>
            <Paperclip size={22} color={BrandColors.gray500} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={t("type Message")}
            placeholderTextColor={BrandColors.gray400}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (messageText.trim() === "" || isGuest) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={messageText.trim() === "" || isGuest}
          >
            <Send
              size={20}
              color={
                messageText.trim() === "" || isGuest
                  ? BrandColors.gray400
                  : BrandColors.white
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  keyboardView: {
    flex: 1,
  },
  headerRight: {
    position: "relative",
    marginRight: 16,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messagesList: {
    padding: 16,
    gap: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  theirMessageContainer: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 12,
    paddingBottom: 8,
    gap: 4,
  },
  myMessageBubble: {
    backgroundColor: BrandColors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: BrandColors.white,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: BrandColors.white,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
    gap: 12,
    alignItems: "flex-end",
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: BrandColors.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: BrandColors.neutralDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: BrandColors.gray200,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centerText: {
    fontSize: 16,
    color: BrandColors.gray500,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 15,
    color: BrandColors.gray600,
    textAlign: "center",
    lineHeight: 22,
  },
});
