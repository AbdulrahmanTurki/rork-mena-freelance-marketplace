import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useOrder, useDeliverOrder } from "@/hooks/useOrders";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Upload,
  X,
  Send,
  Link,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function SellerOrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const router = useRouter();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [deliveryFiles, setDeliveryFiles] = useState<string[]>([]);
  const [fileInput, setFileInput] = useState("");

  const { data: order, isLoading, error } = useOrder(id as string);
  const deliverOrderMutation = useDeliverOrder();

  const gig = order?.gig;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: "Order Details",
            headerStyle: { backgroundColor: theme.headerBackground },
            headerTintColor: theme.text,
          }}
        />
        <View style={styles.errorState}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' && error !== null 
        ? (error as any).message || 'Unknown error occurred'
        : String(error);
    console.error("Error fetching order:", {
      message: errorMessage,
      orderId: id,
      errorType: typeof error
    });
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: "Order Details",
            headerStyle: { backgroundColor: theme.headerBackground },
            headerTintColor: theme.text,
          }}
        />
        <View style={styles.errorState}>
          <AlertCircle size={64} color={BrandColors.gray300} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Error Loading Order
          </Text>
          <Text style={[styles.errorDescription, { color: theme.secondaryText }]}>
            {error instanceof Error 
              ? error.message 
              : typeof error === 'object' && error !== null && 'message' in error
                ? String(error.message)
                : "Failed to load order details. Please try again."}
          </Text>
        </View>
      </View>
    );
  }

  if (!order || !gig) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            title: "Order Details",
            headerStyle: { backgroundColor: theme.headerBackground },
            headerTintColor: theme.text,
          }}
        />
        <View style={styles.errorState}>
          <AlertCircle size={64} color={BrandColors.gray300} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Order not found
          </Text>
          <Text style={[styles.errorDescription, { color: theme.secondaryText }]}>
            This order does not exist or has been removed.
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in_progress":
        return BrandColors.primary;
      case "delivered":
        return BrandColors.secondary;
      case "completed":
        return BrandColors.success;
      case "cancelled":
        return BrandColors.error;
      case "revision_requested":
        return BrandColors.warning;
      default:
        return BrandColors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
      case "in_progress":
        return "In Progress";
      case "delivered":
        return "Delivered";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      case "revision_requested":
        return "Revision Requested";
      default:
        return status;
    }
  };

  const handleContactBuyer = () => {
    router.push(`/seller/chat/${id}` as any);
  };

  const handleDeliverOrder = () => {
    setShowDeliveryModal(true);
  };

  const handleAddFile = () => {
    if (!fileInput.trim()) {
      Alert.alert("Error", "Please enter a valid file URL");
      return;
    }
    setDeliveryFiles([...deliveryFiles, fileInput]);
    setFileInput("");
  };

  const handleRemoveFile = (index: number) => {
    setDeliveryFiles(deliveryFiles.filter((_, i) => i !== index));
  };

  const handleSubmitDelivery = async () => {
    if (!deliveryMessage.trim() && deliveryFiles.length === 0) {
      Alert.alert("Error", "Please provide a delivery message or upload files");
      return;
    }

    try {
      await deliverOrderMutation.mutateAsync({
        orderId: id as string,
        deliveryFiles: deliveryFiles,
      });
      Alert.alert("Success", "Order delivered successfully!", [
        { text: "OK", onPress: () => setShowDeliveryModal(false) },
      ]);
      setDeliveryMessage("");
      setDeliveryFiles([]);
    } catch (error) {
      console.error("Error delivering order:", error);
      Alert.alert("Error", "Failed to deliver order. Please try again.");
    }
  };

  const pendingRevisions = order.revisions?.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  ) || [];
  const completedRevisions = order.revisions?.filter(
    (r) => r.status === "completed"
  ) || [];

  const packageType = "basic";

  const revisionsRemaining = order.revisions_allowed === -1
    ? "Unlimited"
    : Math.max(0, (order.revisions_allowed || 0) - (order.revisions_used || 0));

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Order Details",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.statusCard,
            { backgroundColor: getStatusColor(order.status) + "15" },
          ]}
        >
          <View style={styles.statusHeader}>
            <CheckCircle
              size={32}
              color={getStatusColor(order.status)}
              fill={getStatusColor(order.status) + "40"}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Order Status</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: getStatusColor(order.status) },
                ]}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
        </View>

        {pendingRevisions.length > 0 && (
          <View style={[styles.alertCard, { backgroundColor: BrandColors.warning + "15" }]}>
            <View style={styles.alertHeader}>
              <RefreshCw size={24} color={BrandColors.warning} />
              <Text style={[styles.alertTitle, { color: BrandColors.warning }]}>
                Revision Requested
              </Text>
            </View>
            <Text style={[styles.alertDescription, { color: theme.text }]}>
              The buyer has requested changes to your delivery. Please review and
              respond.
            </Text>
          </View>
        )}

        <View style={[styles.gigCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Service Details
          </Text>
          <View style={styles.gigContent}>
            <Image 
              source={{ uri: gig.images?.[0] || "https://via.placeholder.com/100" }} 
              style={styles.gigImage} 
            />
            <View style={styles.gigInfo}>
              <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                {gig.title}
              </Text>
              <View style={styles.gigMeta}>
                <Text style={[styles.packageLabel, { color: theme.secondaryText }]}>
                  {packageType.charAt(0).toUpperCase() +
                    packageType.slice(1)}{" "}
                  Package
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Order Information
          </Text>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <FileText size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Order ID</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                #{order.id.slice(0, 8)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Calendar size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Order Placed</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(order.created_at)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Clock size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Delivery Date</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {order.auto_release_at ? formatDate(order.auto_release_at) : "Not set"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Package size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Package</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {packageType.charAt(0).toUpperCase() +
                  packageType.slice(1)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <RefreshCw size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Revisions</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {revisionsRemaining} remaining
              </Text>
            </View>
          </View>
        </View>

        {pendingRevisions.length > 0 && (
          <View style={[styles.revisionsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Pending Revisions
            </Text>
            {pendingRevisions.map((revision) => (
              <View
                key={revision.id}
                style={[styles.revisionItem, { borderColor: theme.border }]}
              >
                <View style={styles.revisionHeader}>
                  <Text style={[styles.revisionDate, { color: theme.secondaryText }]}>
                    {formatDate(revision.requested_at)}
                  </Text>
                  <View
                    style={[
                      styles.revisionStatus,
                      { backgroundColor: BrandColors.warning + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.revisionStatusText,
                        { color: BrandColors.warning },
                      ]}
                    >
                      {revision.status === "in_progress"
                        ? "In Progress"
                        : "Pending"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.revisionReason, { color: theme.text }]}>
                  {revision.request_message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {completedRevisions.length > 0 && (
          <View style={[styles.revisionsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Completed Revisions
            </Text>
            {completedRevisions.map((revision) => (
              <View
                key={revision.id}
                style={[styles.revisionItem, { borderColor: theme.border }]}
              >
                <View style={styles.revisionHeader}>
                  <Text style={[styles.revisionDate, { color: theme.secondaryText }]}>
                    {formatDate(revision.requested_at)}
                  </Text>
                  <View
                    style={[
                      styles.revisionStatus,
                      { backgroundColor: BrandColors.success + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.revisionStatusText,
                        { color: BrandColors.success },
                      ]}
                    >
                      Completed
                    </Text>
                  </View>
                </View>
                <Text style={[styles.revisionReason, { color: theme.text }]}>
                  {revision.request_message}
                </Text>
                {revision.response_message && (
                  <View
                    style={[
                      styles.revisionResponse,
                      { backgroundColor: theme.inputBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.revisionResponseLabel,
                        { color: theme.secondaryText },
                      ]}
                    >
                      Your Response:
                    </Text>
                    <Text
                      style={[styles.revisionResponseText, { color: theme.text }]}
                    >
                      {revision.response_message}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={[styles.priceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Earnings
          </Text>
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Order Value</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                SAR {order.gig_price}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Platform Fee (15%)</Text>
              <Text style={[styles.priceValue, { color: BrandColors.error }]}>
                -SAR {order.platform_fee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                Your Earnings
              </Text>
              <Text style={styles.totalValue}>
                SAR {order.seller_net_amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactBuyer}
          >
            <MessageSquare size={20} color={BrandColors.primary} />
            <Text style={styles.contactButtonText}>Contact Buyer</Text>
          </TouchableOpacity>

          {(order.status === "active" || order.status === "in_progress" || order.status === "revision_requested") && (
            <TouchableOpacity
              style={styles.deliverButton}
              onPress={handleDeliverOrder}
              disabled={deliverOrderMutation.isPending}
            >
              {deliverOrderMutation.isPending ? (
                <ActivityIndicator size="small" color={BrandColors.white} />
              ) : (
                <>
                  <Upload size={20} color={BrandColors.white} />
                  <Text style={styles.deliverButtonText}>Deliver Order</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {order.status === "delivered" && (
            <View style={[styles.deliveredCard, { backgroundColor: BrandColors.success + "15" }]}>
              <CheckCircle size={24} color={BrandColors.success} />
              <Text style={[styles.deliveredText, { color: BrandColors.success }]}>
                Order Delivered - Waiting for buyer approval
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showDeliveryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Deliver Order
              </Text>
              <TouchableOpacity onPress={() => setShowDeliveryModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.secondaryText }]}>
              Provide delivery message (optional) and add file URLs:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Delivery message (optional)..."
              placeholderTextColor={theme.tertiaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={deliveryMessage}
              onChangeText={setDeliveryMessage}
            />

            <Text style={[styles.modalSectionLabel, { color: theme.text }]}>
              Delivery Files
            </Text>

            <View style={styles.fileInputContainer}>
              <TextInput
                style={[
                  styles.fileInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter file URL..."
                placeholderTextColor={theme.tertiaryText}
                value={fileInput}
                onChangeText={setFileInput}
              />
              <TouchableOpacity
                style={styles.addFileButton}
                onPress={handleAddFile}
              >
                <Text style={styles.addFileButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {deliveryFiles.length > 0 && (
              <View style={styles.filesList}>
                {deliveryFiles.map((file, index) => (
                  <View
                    key={index}
                    style={[
                      styles.fileItem,
                      { backgroundColor: theme.inputBackground },
                    ]}
                  >
                    <Link size={16} color={theme.text} />
                    <Text
                      style={[styles.fileText, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {file}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                      <X size={18} color={BrandColors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setShowDeliveryModal(false);
                  setDeliveryMessage("");
                  setDeliveryFiles([]);
                  setFileInput("");
                }}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  deliverOrderMutation.isPending && styles.disabledButton,
                ]}
                onPress={handleSubmitDelivery}
                disabled={deliverOrderMutation.isPending}
              >
                {deliverOrderMutation.isPending ? (
                  <ActivityIndicator size="small" color={BrandColors.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Delivery</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: BrandColors.gray600,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: "700" as const,
  },
  alertCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.warning,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  gigCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 16,
  },
  gigContent: {
    flexDirection: "row",
    gap: 12,
  },
  gigImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: BrandColors.gray200,
  },
  gigInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  gigTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    lineHeight: 20,
  },
  gigMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  detailsCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  detailsList: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  revisionsCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  revisionItem: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
    paddingTop: 16,
    marginTop: 16,
  },
  revisionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  revisionDate: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  revisionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  revisionStatusText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  revisionReason: {
    fontSize: 14,
    color: BrandColors.neutralDark,
    lineHeight: 20,
    marginBottom: 12,
  },
  revisionResponse: {
    backgroundColor: BrandColors.gray100,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  revisionResponseLabel: {
    fontSize: 12,
    color: BrandColors.gray600,
    marginBottom: 6,
    fontWeight: "600" as const,
  },
  revisionResponseText: {
    fontSize: 13,
    color: BrandColors.neutralDark,
    lineHeight: 18,
  },
  respondButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  respondButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  priceCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  priceDetails: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  divider: {
    height: 1,
    backgroundColor: BrandColors.gray200,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.success,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  deliverButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deliverButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  revisionDetails: {
    backgroundColor: BrandColors.gray100,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  revisionDetailsLabel: {
    fontSize: 12,
    color: BrandColors.gray600,
    marginBottom: 6,
    fontWeight: "600" as const,
  },
  revisionDetailsText: {
    fontSize: 14,
    color: BrandColors.neutralDark,
    lineHeight: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: BrandColors.gray600,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    backgroundColor: BrandColors.gray100,
    borderWidth: 1,
    borderColor: BrandColors.gray300,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: BrandColors.neutralDark,
    minHeight: 120,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BrandColors.gray300,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginTop: 24,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 15,
    color: BrandColors.gray500,
    textAlign: "center",
    lineHeight: 22,
  },
  bottomPadding: {
    height: 40,
  },
  deliveredCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  deliveredText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalSectionLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginTop: 16,
    marginBottom: 8,
  },
  fileInputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  fileInput: {
    flex: 1,
    backgroundColor: BrandColors.gray100,
    borderWidth: 1,
    borderColor: BrandColors.gray300,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: BrandColors.neutralDark,
  },
  addFileButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addFileButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  filesList: {
    gap: 8,
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  fileText: {
    flex: 1,
    fontSize: 13,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
