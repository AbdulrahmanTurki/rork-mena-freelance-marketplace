import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  Send,
  Paperclip,
  X,
  DollarSign,
  Clock,
  RefreshCw,
  Plus,
  FileText,
  Check,
} from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage, useMarkAllMessagesAsRead } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";

type CustomOffer = {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  extras: string[];
  status: "sent" | "viewed" | "accepted" | "declined" | "expired";
  timestamp: string;
  senderId: string;
};

type OfferTemplate = {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  extras: string[];
};

const offerTemplates: OfferTemplate[] = [
  {
    id: "t1",
    title: "Logo Design Package",
    description: "Professional logo design with 3 concepts and unlimited revisions",
    price: 300,
    deliveryDays: 5,
    revisions: -1,
    extras: ["Source files", "Social media kit", "Brand guidelines"],
  },
  {
    id: "t2",
    title: "Quick Logo Update",
    description: "Fast logo modifications and adjustments",
    price: 100,
    deliveryDays: 2,
    revisions: 2,
    extras: ["All file formats"],
  },
  {
    id: "t3",
    title: "Brand Identity Package",
    description: "Complete brand identity including logo, colors, and typography",
    price: 800,
    deliveryDays: 10,
    revisions: -1,
    extras: ["Logo design", "Color palette", "Typography guide", "Business cards"],
  },
];

export default function SellerChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { data: messages = [], isLoading: messagesLoading } = useMessages(id as string);
  const { data: profiles = [] } = useProfiles();
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAllMessagesAsRead();

  const otherUserId = messages.length > 0
    ? messages[0].sender_id === user?.id
      ? messages[0].receiver_id
      : messages[0].sender_id
    : null;

  const otherUser = profiles.find((p) => p.id === otherUserId);

  useEffect(() => {
    if (id && user?.id) {
      markAsReadMutation.mutate(id as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    price: "",
    deliveryDays: "",
    revisions: "",
    extras: [] as string[],
  });

  const [newExtra, setNewExtra] = useState("");

  const handleSend = async () => {
    if (messageText.trim() === "" || !user?.id || !id || !otherUserId) return;

    const messageContent = messageText.trim();
    setMessageText("");

    try {
      await sendMessageMutation.mutateAsync({
        order_id: id as string,
        sender_id: user.id,
        receiver_id: otherUserId,
        message: messageContent,
        attachments: [],
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("[handleSend] Error:", error);
      setMessageText(messageContent);
    }
  };

  const handleSendOffer = () => {
    if (!offerForm.title || !offerForm.price || !offerForm.deliveryDays) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    const price = parseFloat(offerForm.price);
    const deliveryDays = parseInt(offerForm.deliveryDays);
    const revisions = offerForm.revisions ? parseInt(offerForm.revisions) : 0;

    if (isNaN(price) || price <= 0) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar" ? "السعر غير صحيح" : "Invalid price"
      );
      return;
    }

    Alert.alert(
      language === "ar" ? "نجح" : "Success",
      language === "ar"
        ? "تم إرسال العرض بنجاح"
        : "Offer sent successfully (Custom offers feature coming soon)"
    );

    setShowOfferModal(false);
    resetOfferForm();
  };

  const resetOfferForm = () => {
    setOfferForm({
      title: "",
      description: "",
      price: "",
      deliveryDays: "",
      revisions: "",
      extras: [],
    });
  };

  const applyTemplate = (template: OfferTemplate) => {
    setOfferForm({
      title: template.title,
      description: template.description,
      price: template.price.toString(),
      deliveryDays: template.deliveryDays.toString(),
      revisions: template.revisions === -1 ? "Unlimited" : template.revisions.toString(),
      extras: [...template.extras],
    });
    setShowTemplatesModal(false);
    setShowOfferModal(true);
  };

  const addExtra = () => {
    if (newExtra.trim()) {
      setOfferForm({
        ...offerForm,
        extras: [...offerForm.extras, newExtra.trim()],
      });
      setNewExtra("");
    }
  };

  const removeExtra = (index: number) => {
    setOfferForm({
      ...offerForm,
      extras: offerForm.extras.filter((_, i) => i !== index),
    });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
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

  if (messagesLoading || !otherUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: "Chat",
            headerStyle: {
              backgroundColor: theme.headerBackground,
            },
            headerTintColor: theme.text,
          }}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.text }}>
            {messagesLoading ? "Loading..." : "No conversation found"}
          </Text>
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
                source={{
                  uri: otherUser.avatar_url || "https://via.placeholder.com/150",
                }}
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

        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.inputBackground }]}
            onPress={() => setShowTemplatesModal(true)}
          >
            <FileText size={22} color={BrandColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.inputBackground }]}
            onPress={() => setShowOfferModal(true)}
          >
            <DollarSign size={22} color={BrandColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.inputBackground }]}>
            <Paperclip size={22} color={BrandColors.gray500} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }, isRTL && { textAlign: "right" }]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
            placeholderTextColor={BrandColors.gray400}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              messageText.trim() === "" && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={messageText.trim() === ""}
          >
            <Send
              size={20}
              color={
                messageText.trim() === "" ? BrandColors.gray400 : BrandColors.white
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showTemplatesModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplatesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === "ar" ? "قوالب العروض" : "Offer Templates"}
              </Text>
              <TouchableOpacity onPress={() => setShowTemplatesModal(false)}>
                <X size={24} color={BrandColors.neutralDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.templatesList}>
              {offerTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => applyTemplate(template)}
                >
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templateDescription}>
                    {template.description}
                  </Text>
                  <View style={styles.templateDetails}>
                    <Text style={styles.templatePrice}>${template.price}</Text>
                    <Text style={styles.templateDelivery}>
                      {template.deliveryDays} {language === "ar" ? "يوم" : "days"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => {
                  setShowTemplatesModal(false);
                  setShowOfferModal(true);
                }}
              >
                <Plus size={20} color={BrandColors.primary} />
                <Text style={styles.createNewText}>
                  {language === "ar" ? "إنشاء عرض جديد" : "Create New Offer"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowOfferModal(false);
          resetOfferForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {language === "ar" ? "إنشاء عرض مخصص" : "Create Custom Offer"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowOfferModal(false);
                    resetOfferForm();
                  }}
                >
                  <X size={24} color={BrandColors.neutralDark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.offerForm}>
                <Text style={styles.label}>
                  {language === "ar" ? "عنوان الخدمة *" : "Service Title *"}
                </Text>
                <TextInput
                  style={[styles.formInput, isRTL && { textAlign: "right" }]}
                  value={offerForm.title}
                  onChangeText={(text) =>
                    setOfferForm({ ...offerForm, title: text })
                  }
                  placeholder={
                    language === "ar"
                      ? "مثال: تصميم لوغو احترافي"
                      : "e.g., Professional Logo Design"
                  }
                  placeholderTextColor={BrandColors.gray400}
                />

                <Text style={styles.label}>
                  {language === "ar" ? "الوصف" : "Description"}
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.textArea,
                    isRTL && { textAlign: "right" },
                  ]}
                  value={offerForm.description}
                  onChangeText={(text) =>
                    setOfferForm({ ...offerForm, description: text })
                  }
                  placeholder={
                    language === "ar"
                      ? "وصف تفصيلي للخدمة..."
                      : "Detailed description of the service..."
                  }
                  placeholderTextColor={BrandColors.gray400}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>
                      {language === "ar" ? "السعر ($) *" : "Price ($) *"}
                    </Text>
                    <TextInput
                      style={[styles.formInput, isRTL && { textAlign: "right" }]}
                      value={offerForm.price}
                      onChangeText={(text) =>
                        setOfferForm({ ...offerForm, price: text })
                      }
                      placeholder="300"
                      keyboardType="numeric"
                      placeholderTextColor={BrandColors.gray400}
                    />
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.label}>
                      {language === "ar" ? "مدة التسليم *" : "Delivery Days *"}
                    </Text>
                    <TextInput
                      style={[styles.formInput, isRTL && { textAlign: "right" }]}
                      value={offerForm.deliveryDays}
                      onChangeText={(text) =>
                        setOfferForm({ ...offerForm, deliveryDays: text })
                      }
                      placeholder="5"
                      keyboardType="numeric"
                      placeholderTextColor={BrandColors.gray400}
                    />
                  </View>
                </View>

                <Text style={styles.label}>
                  {language === "ar" ? "عدد التعديلات" : "Number of Revisions"}
                </Text>
                <TextInput
                  style={[styles.formInput, isRTL && { textAlign: "right" }]}
                  value={offerForm.revisions}
                  onChangeText={(text) =>
                    setOfferForm({ ...offerForm, revisions: text })
                  }
                  placeholder={language === "ar" ? "مثال: 3 أو Unlimited" : "e.g., 3 or Unlimited"}
                  placeholderTextColor={BrandColors.gray400}
                />

                <Text style={styles.label}>
                  {language === "ar" ? "الإضافات" : "Extras"}
                </Text>
                <View style={styles.extrasInput}>
                  <TextInput
                    style={[styles.extraInputField, isRTL && { textAlign: "right" }]}
                    value={newExtra}
                    onChangeText={setNewExtra}
                    placeholder={
                      language === "ar"
                        ? "أضف ميزة إضافية..."
                        : "Add an extra feature..."
                    }
                    placeholderTextColor={BrandColors.gray400}
                    onSubmitEditing={addExtra}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={addExtra}>
                    <Plus size={20} color={BrandColors.white} />
                  </TouchableOpacity>
                </View>

                {offerForm.extras.map((extra, index) => (
                  <View key={index} style={styles.extraChip}>
                    <Text style={styles.extraChipText}>{extra}</Text>
                    <TouchableOpacity onPress={() => removeExtra(index)}>
                      <X size={16} color={BrandColors.gray600} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>
                    {language === "ar"
                      ? "⚠️ جميع المدفوعات يجب أن تتم من خلال المنصة لحماية حقوقك"
                      : "⚠️ All payments must be made through the platform to protect your rights"}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.sendOfferButton}
                  onPress={handleSendOffer}
                >
                  <Text style={styles.sendOfferButtonText}>
                    {language === "ar" ? "إرسال العرض" : "Send Offer"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    position: "relative" as const,
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
    padding: 12,
    backgroundColor: BrandColors.white,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
    gap: 8,
    alignItems: "flex-end",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: BrandColors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: BrandColors.neutralDark,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: BrandColors.gray200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  templatesList: {
    padding: 20,
  },
  templateCard: {
    backgroundColor: BrandColors.neutralLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 6,
  },
  templateDescription: {
    fontSize: 14,
    color: BrandColors.gray600,
    marginBottom: 12,
    lineHeight: 20,
  },
  templateDetails: {
    flexDirection: "row",
    gap: 16,
  },
  templatePrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  templateDelivery: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  createNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.primary + "10",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    borderStyle: "dashed",
  },
  createNewText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  offerForm: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: BrandColors.gray100,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: BrandColors.neutralDark,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  extrasInput: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  extraInputField: {
    flex: 1,
    backgroundColor: BrandColors.gray100,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: BrandColors.neutralDark,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  extraChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BrandColors.primary + "10",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  extraChipText: {
    fontSize: 14,
    color: BrandColors.primary,
    fontWeight: "600" as const,
    flex: 1,
  },
  warningBox: {
    backgroundColor: BrandColors.secondary + "20",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: BrandColors.secondary,
  },
  warningText: {
    fontSize: 13,
    color: BrandColors.neutralDark,
    lineHeight: 18,
  },
  sendOfferButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  sendOfferButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
});
