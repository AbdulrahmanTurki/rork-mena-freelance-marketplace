import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  IdCard,
  FileText,
  User,
  Calendar,
  Phone,
} from "lucide-react-native";
import { Image } from "expo-image";
import { BrandColors } from "@/constants/colors";
import { useAdminVerifications, useApproveVerification, useRejectVerification, AdminVerification } from "@/hooks/useAdminVerifications";



export default function VerificationRequestsScreen() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedRequest, setSelectedRequest] = useState<AdminVerification | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const isRTL = language === "ar";

  const { data: requests, isLoading, error } = useAdminVerifications(filterStatus);
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();

  const filteredRequests = (requests || []).filter((req) => {
    if (!searchQuery) return true;
    const matchesSearch =
      req.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return BrandColors.secondary;
      case "pending":
        return BrandColors.amber;
      case "rejected":
        return BrandColors.error;
      default:
        return theme.secondaryText;
    }
  };

  const getStatusText = (status: string) => {
    if (isRTL) {
      switch (status) {
        case "approved":
          return "تمت الموافقة";
        case "pending":
          return "قيد المراجعة";
        case "rejected":
          return "مرفوض";
        default:
          return status;
      }
    }
    switch (status) {
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      await approveMutation.mutateAsync({
        verificationId: selectedRequest.id,
        reviewedBy: "admin1",
      });

      Alert.alert(
        "Success",
        `${selectedRequest.user?.full_name || 'User'}'s verification has been approved.`
      );
      setShowRequestModal(false);
      setSelectedRequest(null);
    } catch (error: any) {
      console.error("Error approving verification:", error);
      Alert.alert("Error", error?.message || "Failed to approve verification");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) {
      Alert.alert("Error", "Please provide a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        verificationId: selectedRequest.id,
        reason: rejectionReason,
        reviewedBy: "admin1",
      });

      Alert.alert(
        "Rejected",
        `${selectedRequest.user?.full_name || 'User'}'s verification has been rejected.`
      );
      setShowRequestModal(false);
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (error: any) {
      console.error("Error rejecting verification:", error);
      Alert.alert("Error", error?.message || "Failed to reject verification");
    }
  };

  const RequestCard = ({ request }: { request: AdminVerification }) => {
    console.log('[RequestCard] Verification data:', {
      id: request.id,
      user_id: request.user_id,
      status: request.status,
      hasIdFront: !!request.id_front_url,
      hasIdBack: !!request.id_back_url,
      hasPermit: !!request.permit_document_url,
      idFrontUrl: request.id_front_url,
      idBackUrl: request.id_back_url,
      permitUrl: request.permit_document_url,
    });
    return (
    <TouchableOpacity
      style={[styles.requestCard, { backgroundColor: theme.card }]}
      onPress={() => {
        setSelectedRequest(request);
        setShowRequestModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <View
          style={[
            styles.requestAvatar,
            { backgroundColor: BrandColors.primary + "20" },
          ]}
        >
          <User size={24} color={BrandColors.primary} />
        </View>
        <View style={styles.requestInfo}>
          <Text style={[styles.requestName, { color: theme.text }]}>
            {request.user?.full_name || "Unknown User"}
          </Text>
          <Text style={[styles.requestNameAr, { color: theme.secondaryText }]}>
            {request.user?.email || "No email"}
          </Text>
          <View style={styles.requestMeta}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(request.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(request.status) },
                ]}
              >
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <IdCard size={14} color={theme.tertiaryText} />
          <Text style={[styles.detailText, { color: theme.tertiaryText }]}>
            {request.permit_number || "N/A"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={14} color={theme.tertiaryText} />
          <Text style={[styles.detailText, { color: theme.tertiaryText }]}>
            {new Date(request.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: isRTL ? "طلبات التحقق" : "Verification Requests",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBackground, paddingTop: insets.top + 16 },
        ]}
      >
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.inputBackground },
          ]}
        >
          <Search size={20} color={theme.tertiaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={
              isRTL ? "بحث عن الطلبات..." : "Search verification requests..."
            }
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterChips}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["all", "pending", "approved", "rejected"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filterStatus === status ? BrandColors.primary : theme.card,
                  },
                ]}
                onPress={() =>
                  setFilterStatus(
                    status as "all" | "pending" | "approved" | "rejected"
                  )
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: filterStatus === status ? "#fff" : theme.text },
                  ]}
                >
                  {status === "all"
                    ? isRTL
                      ? "الكل"
                      : "All"
                    : getStatusText(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <AlertCircle size={64} color={BrandColors.error} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {isRTL ? "خطأ في تحميل الطلبات" : "Error loading requests"}
            </Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <Shield size={64} color={theme.tertiaryText} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              {isRTL ? "لا توجد طلبات تحقق" : "No verification requests"}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </ScrollView>

      <Modal
        visible={showRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            {selectedRequest && (
              <>
                <View style={styles.modalHeader}>
                  {console.log('[Modal Opened] Selected request:', {
                    id: selectedRequest.id,
                    user_id: selectedRequest.user_id,
                    hasIdFront: !!selectedRequest.id_front_url,
                    hasIdBack: !!selectedRequest.id_back_url,
                    hasPermit: !!selectedRequest.permit_document_url,
                    idFrontUrl: selectedRequest.id_front_url,
                    idBackUrl: selectedRequest.id_back_url,
                    permitUrl: selectedRequest.permit_document_url,
                  })}
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {isRTL ? "تفاصيل الطلب" : "Request Details"}
                  </Text>
                  <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                    <XCircle size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      <User size={16} color={BrandColors.primary} />{" "}
                      {isRTL ? "المعلومات الشخصية" : "Personal Information"}
                    </Text>

                    <View style={styles.infoRow}>
                      <Text
                        style={[styles.infoLabel, { color: theme.secondaryText }]}
                      >
                        {isRTL ? "الاسم" : "Full Name"}
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {selectedRequest.user?.full_name || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text
                        style={[styles.infoLabel, { color: theme.secondaryText }]}
                      >
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {selectedRequest.user?.email || "N/A"}
                      </Text>
                    </View>
                  </View>



                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      <IdCard size={16} color={BrandColors.primary} />{" "}
                      {isRTL ? "وثائق الهوية" : "Identity Documents"}
                    </Text>

                    <View style={styles.documentsRow}>
                      <TouchableOpacity
                        style={[
                          styles.documentPreview,
                          { backgroundColor: theme.background },
                        ]}
                        onPress={() => {
                          console.log('[Modal] ID Front click - URL:', selectedRequest.id_front_url);
                          if (selectedRequest.id_front_url) {
                            setSelectedImage(selectedRequest.id_front_url);
                            setShowImageModal(true);
                          } else {
                            console.log('[Modal] No ID front URL');
                          }
                        }}
                      >
                        {selectedRequest.id_front_url ? (
                          <>
                            <Image
                              source={{ uri: selectedRequest.id_front_url }}
                              style={styles.documentImage}
                              contentFit="cover"
                              onError={(e) => {
                                console.log('[Image Error] ID Front:', JSON.stringify(e, null, 2));
                                console.log('[Image Error] ID Front URL:', selectedRequest.id_front_url);
                              }}
                              onLoad={() => console.log('[Image Loaded] ID Front successfully')}
                              onLoadStart={() => console.log('[Image Loading] ID Front started')}
                            />
                            <Text style={[styles.debugText, { color: theme.tertiaryText, fontSize: 8, marginTop: 2 }]}>Loading...</Text>
                          </>
                        ) : (
                          <IdCard size={32} color={theme.tertiaryText} />
                        )}
                        <Text
                          style={[
                            styles.documentLabel,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {isRTL ? "الهوية (أمامي)" : "ID Front"}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.documentPreview,
                          { backgroundColor: theme.background },
                        ]}
                        onPress={() => {
                          console.log('[Modal] ID Back click - URL:', selectedRequest.id_back_url);
                          if (selectedRequest.id_back_url) {
                            setSelectedImage(selectedRequest.id_back_url);
                            setShowImageModal(true);
                          } else {
                            console.log('[Modal] No ID back URL');
                          }
                        }}
                      >
                        {selectedRequest.id_back_url ? (
                          <>
                            <Image
                              source={{ uri: selectedRequest.id_back_url }}
                              style={styles.documentImage}
                              contentFit="cover"
                              onError={(e) => {
                                console.log('[Image Error] ID Back:', JSON.stringify(e, null, 2));
                                console.log('[Image Error] ID Back URL:', selectedRequest.id_back_url);
                              }}
                              onLoad={() => console.log('[Image Loaded] ID Back successfully')}
                              onLoadStart={() => console.log('[Image Loading] ID Back started')}
                            />
                            <Text style={[styles.debugText, { color: theme.tertiaryText, fontSize: 8, marginTop: 2 }]}>Loading...</Text>
                          </>
                        ) : (
                          <IdCard size={32} color={theme.tertiaryText} />
                        )}
                        <Text
                          style={[
                            styles.documentLabel,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {isRTL ? "الهوية (خلفي)" : "ID Back"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      <Shield size={16} color={BrandColors.primary} />{" "}
                      {isRTL ? "وثيقة العمل الحر" : "Freelance Permit"}
                    </Text>

                    <View style={styles.infoRow}>
                      <Text
                        style={[styles.infoLabel, { color: theme.secondaryText }]}
                      >
                        {isRTL ? "رقم الوثيقة" : "Permit Number"}
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {selectedRequest.permit_number || "N/A"}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text
                        style={[styles.infoLabel, { color: theme.secondaryText }]}
                      >
                        {isRTL ? "تاريخ الانتهاء" : "Expiration Date"}
                      </Text>
                      <Text style={[styles.infoValue, { color: theme.text }]}>
                        {selectedRequest.permit_expiration_date ? new Date(selectedRequest.permit_expiration_date).toLocaleDateString() : "N/A"}
                      </Text>
                    </View>

                    {selectedRequest.permit_document_url && (
                      <TouchableOpacity
                        style={[
                          styles.permitDocumentBox,
                          { backgroundColor: theme.background },
                        ]}
                        onPress={() => {
                          console.log('[Modal] Permit click - URL:', selectedRequest.permit_document_url);
                          if (selectedRequest.permit_document_url) {
                            setSelectedImage(selectedRequest.permit_document_url);
                            setShowImageModal(true);
                          } else {
                            console.log('[Modal] No permit URL');
                          }
                        }}
                      >
                        <Image
                          source={{ uri: selectedRequest.permit_document_url }}
                          style={{ width: "100%", height: 150, borderRadius: 8 }}
                          contentFit="cover"
                          onError={(e) => console.log('[Image Error] Permit:', e)}
                          onLoad={() => console.log('[Image Loaded] Permit successfully')}
                        />
                        <Text
                          style={[
                            styles.documentLabel,
                            { color: theme.secondaryText },
                          ]}
                        >
                          {isRTL ? "عرض الوثيقة" : "View Document"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {selectedRequest.status === "pending" && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        {isRTL ? "سبب الرفض (اختياري)" : "Rejection Reason (Optional)"}
                      </Text>
                      <TextInput
                        style={[
                          styles.reasonInput,
                          {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                          },
                        ]}
                        placeholder={
                          isRTL
                            ? "اكتب سبب الرفض..."
                            : "Enter rejection reason..."
                        }
                        placeholderTextColor={theme.tertiaryText}
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  )}

                  {selectedRequest.status === "rejected" &&
                    selectedRequest.rejectionReason && (
                      <View
                        style={[
                          styles.rejectionBox,
                          { backgroundColor: BrandColors.error + "20" },
                        ]}
                      >
                        <AlertCircle size={20} color={BrandColors.error} />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.rejectionTitle,
                              { color: BrandColors.error },
                            ]}
                          >
                            {isRTL ? "سبب الرفض" : "Rejection Reason"}
                          </Text>
                          <Text
                            style={[
                              styles.rejectionText,
                              { color: BrandColors.error },
                            ]}
                          >
                            {selectedRequest.rejectionReason}
                          </Text>
                        </View>
                      </View>
                    )}
                </ScrollView>

                {selectedRequest.status === "pending" && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: BrandColors.secondary },
                        approveMutation.isPending && { opacity: 0.6 }
                      ]}
                      onPress={handleApprove}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <CheckCircle size={20} color="#fff" />
                      )}
                      <Text style={styles.actionButtonText}>
                        {approveMutation.isPending 
                          ? (isRTL ? "جاري الموافقة..." : "Approving...") 
                          : (isRTL ? "موافقة" : "Approve")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: BrandColors.error },
                        rejectMutation.isPending && { opacity: 0.6 }
                      ]}
                      onPress={handleReject}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <XCircle size={20} color="#fff" />
                      )}
                      <Text style={styles.actionButtonText}>
                        {rejectMutation.isPending 
                          ? (isRTL ? "جاري الرفض..." : "Rejecting...") 
                          : (isRTL ? "رفض" : "Reject")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <XCircle size={32} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterChips: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  requestCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  requestNameAr: {
    fontSize: 14,
    marginTop: 2,
  },
  requestMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  requestDetails: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  modalBody: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
    textAlign: "right",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  documentsRow: {
    flexDirection: "row",
    gap: 12,
  },
  documentPreview: {
    flex: 1,
    aspectRatio: 16 / 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  documentImage: {
    width: "100%",
    height: "80%",
    borderRadius: 8,
  },
  documentLabel: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500" as const,
  },
  permitDocumentBox: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  rejectionBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: "90%",
    height: "70%",
    borderRadius: 12,
  },
});
