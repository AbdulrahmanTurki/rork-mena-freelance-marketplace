import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getFreelancerById,
  getGigById,
  getOrderById,
  type Order,
} from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Package,
  Star,
  Download,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  CheckCheck,
  X,
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
} from "react-native";

export default function ViewOrderScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const router = useRouter();
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const order = getOrderById(id as string);
  const gig = order ? getGigById(order.gigId) : null;
  const freelancer = order ? getFreelancerById(order.freelancerId) : null;
  const primarySkill = freelancer?.skills[0] || "Freelancer";

  if (!order || !gig || !freelancer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: "Order Details", headerStyle: { backgroundColor: theme.headerBackground }, headerTintColor: theme.text }} />
        <View style={styles.errorState}>
          <AlertCircle size={64} color={BrandColors.gray300} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Order not found</Text>
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

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "active":
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

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "active":
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

  const handleContactSeller = () => {
    router.push(`/chat/${freelancer.id}` as any);
  };

  const canRequestRevision = () => {
    if (order.status !== "delivered") return false;
    if (order.revisionsAllowed === -1) return true;
    return order.revisionsUsed < order.revisionsAllowed;
  };

  const handleRequestRevision = () => {
    if (!revisionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for the revision");
      return;
    }
    Alert.alert(
      "Success",
      "Your revision request has been sent to the seller",
      [{ text: "OK", onPress: () => setShowRevisionModal(false) }]
    );
    setRevisionReason("");
  };

  const handleAcceptOrder = () => {
    Alert.alert(
      "Accept Order",
      "Are you satisfied with the delivery? This will mark the order as completed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            Alert.alert("Success", "Order completed successfully!");
          },
        },
      ]
    );
  };

  const revisionsRemaining =
    order.revisionsAllowed === -1
      ? "Unlimited"
      : order.revisionsAllowed - order.revisionsUsed;

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

        <View style={[styles.gigCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Details</Text>
          <View style={styles.gigContent}>
            <Image source={{ uri: gig.thumbnail }} style={styles.gigImage} />
            <View style={styles.gigInfo}>
              <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                {gig.title}
              </Text>
              <View style={styles.gigMeta}>
                <Star
                  size={14}
                  fill={BrandColors.secondary}
                  color={BrandColors.secondary}
                />
                <Text style={[styles.gigRating, { color: theme.text }]}>
                  {freelancer.rating} ({freelancer.reviewCount})
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.sellerCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Seller Information</Text>
          <TouchableOpacity style={styles.sellerContent}>
            <Image
              source={{ uri: freelancer.avatar }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: theme.text }]}>{freelancer.name}</Text>
              <Text style={[styles.sellerTitle, { color: theme.secondaryText }]}>{primarySkill}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSeller}
          >
            <MessageSquare size={20} color={BrandColors.primary} />
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Information</Text>
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <FileText size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Order ID</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>#{order.id.slice(0, 8)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Calendar size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Order Placed</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(order.orderDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Clock size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Delivery Date</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(order.dueDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Package size={18} color={BrandColors.gray500} />
                <Text style={styles.detailLabel}>Package</Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {order.packageType.charAt(0).toUpperCase() +
                  order.packageType.slice(1)}
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

        {order.revisions && order.revisions.length > 0 ? (
          <View style={[styles.revisionsCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Revision History</Text>
            {order.revisions.map((revision) => (
              <View key={revision.id} style={[styles.revisionItem, { borderColor: theme.border }]}>
                <View style={styles.revisionHeader}>
                  <Text style={[styles.revisionDate, { color: theme.secondaryText }]}>
                    {formatDate(revision.requestDate)}
                  </Text>
                  <View
                    style={[
                      styles.revisionStatus,
                      {
                        backgroundColor:
                          revision.status === "completed"
                            ? BrandColors.success + "15"
                            : BrandColors.warning + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.revisionStatusText,
                        {
                          color:
                            revision.status === "completed"
                              ? BrandColors.success
                              : BrandColors.warning,
                        },
                      ]}
                    >
                      {revision.status === "completed" ? "Completed" : "Pending"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.revisionReason, { color: theme.text }]}>
                  {revision.reason}
                </Text>
                {revision.response && (
                  <View style={[styles.revisionResponse, { backgroundColor: theme.inputBackground }]}>
                    <Text style={[styles.revisionResponseLabel, { color: theme.secondaryText }]}>
                      Seller Response:
                    </Text>
                    <Text style={[styles.revisionResponseText, { color: theme.text }]}>
                      {revision.response}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : null}

        {order.status === "delivered" || order.status === "completed" ? (
          <View style={[styles.deliveryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery</Text>
            <View style={styles.deliveryContent}>
              <View style={styles.deliveryHeader}>
                <Download size={20} color={BrandColors.success} />
                <Text style={styles.deliveryTitle}>Files Ready</Text>
              </View>
              <Text style={[styles.deliveryDescription, { color: theme.secondaryText }]}>
                Your order has been delivered. Download the files below.
              </Text>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={18} color={BrandColors.white} />
                <Text style={styles.downloadButtonText}>Download Files</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={[styles.priceCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Summary</Text>
          <View style={styles.priceDetails}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Price</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>SAR {order.price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Fee</Text>
              <Text style={[styles.priceValue, { color: theme.text }]}>
                SAR {(order.price * 0.1).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.priceRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
              <Text style={styles.totalValue}>
                SAR {(order.price * 1.1).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {order.status === "delivered" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                !canRequestRevision() && styles.acceptButtonFull,
              ]}
              onPress={handleAcceptOrder}
            >
              <CheckCheck size={20} color={BrandColors.white} />
              <Text style={styles.acceptButtonText}>Accept Order</Text>
            </TouchableOpacity>

            {canRequestRevision() && (
              <TouchableOpacity
                style={styles.revisionButton}
                onPress={() => setShowRevisionModal(true)}
              >
                <RefreshCw size={20} color={BrandColors.white} />
                <Text style={styles.revisionButtonText}>Request Revision</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showRevisionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRevisionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Request Revision
              </Text>
              <TouchableOpacity onPress={() => setShowRevisionModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.secondaryText }]}>
              Please describe what changes you&apos;d like the seller to make:
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
              placeholder="Describe the changes needed..."
              placeholderTextColor={theme.tertiaryText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={revisionReason}
              onChangeText={setRevisionReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setShowRevisionModal(false);
                  setRevisionReason("");
                }}
              >
                <Text style={[styles.modalCancelText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleRequestRevision}
              >
                <Text style={styles.modalSubmitText}>Submit Request</Text>
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
  gigRating: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  sellerCard: {
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
  sellerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  sellerTitle: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.primary,
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
  deliveryCard: {
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
  deliveryContent: {
    gap: 12,
  },
  deliveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.success,
  },
  deliveryDescription: {
    fontSize: 14,
    color: BrandColors.gray600,
    lineHeight: 20,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.success,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  downloadButtonText: {
    fontSize: 15,
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
    color: BrandColors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.success,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: BrandColors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonFull: {
    flex: 1,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  revisionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BrandColors.warning,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: BrandColors.warning,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  revisionButtonText: {
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
  modalDescription: {
    fontSize: 14,
    color: BrandColors.gray600,
    marginBottom: 20,
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
});
