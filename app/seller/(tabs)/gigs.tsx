import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGigs, useUpdateGig, useDeleteGig } from "@/hooks/useGigs";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  Plus,
  Star,
  Eye,
  Edit3,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  ExternalLink,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";

export default function SellerGigs() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGig, setSelectedGig] = useState<string | null>(null);

  const { data: myGigs, isLoading } = useGigs({ sellerId: user?.id, includeInactive: true });
  const updateGigMutation = useUpdateGig();
  const deleteGigMutation = useDeleteGig();

  const handleCreateGig = () => {
    router.push("/seller/create-gig" as any);
  };

  const handleEditGig = (gigId: string) => {
    setSelectedGig(null);
    router.push(`/seller/edit-gig/${gigId}` as any);
  };

  const handlePreviewGig = (gigId: string) => {
    setSelectedGig(null);
    router.push(`/gig/${gigId}` as any);
  };

  const handleToggleStatus = async (gigId: string, currentStatus: boolean) => {
    console.log("Toggle status for gig:", gigId);
    try {
      await updateGigMutation.mutateAsync({
        id: gigId,
        updates: { is_active: !currentStatus },
      });
      setSelectedGig(null);
    } catch (error) {
      console.error("Error toggling gig status:", error);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    console.log("Delete gig:", gigId);
    try {
      await deleteGigMutation.mutateAsync(gigId);
      setSelectedGig(null);
    } catch (error) {
      console.error("Error deleting gig:", error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("my Gigs"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateGig}
            >
              <Plus size={20} color={BrandColors.white} strokeWidth={2.5} />
              <Text style={styles.createButtonText}>{t("create")}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {!myGigs || myGigs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>{t("no Gigs Found")}</Text>
              <TouchableOpacity
                style={styles.createEmptyButton}
                onPress={handleCreateGig}
              >
                <Plus size={20} color={BrandColors.white} strokeWidth={2.5} />
                <Text style={styles.createEmptyButtonText}>{t("create Your First Gig")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myGigs.map((gig) => {
              const thumbnail = gig.images?.[0] || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop';
              const packages = gig.packages as any;
              const startingPrice = packages?.[0]?.price || gig.price || 0;

              return (
                <View key={gig.id} style={[styles.gigCard, { backgroundColor: theme.card }]}>
                  <Image
                    source={{ uri: thumbnail }}
                    style={styles.gigThumbnail}
                  />
                  <TouchableOpacity
                    style={[styles.moreButton, { backgroundColor: theme.card }]}
                    onPress={() => setSelectedGig(gig.id)}
                  >
                    <MoreVertical size={20} color={theme.text} />
                  </TouchableOpacity>
                  
                  <View style={styles.gigContent}>
                    <View style={styles.gigHeader}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: gig.is_active
                              ? BrandColors.primary + "15"
                              : BrandColors.gray300 + "30",
                          },
                        ]}
                      >
                        <View style={[styles.statusDot, {
                          backgroundColor: gig.is_active
                            ? BrandColors.primary
                            : BrandColors.gray500,
                        }]} />
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: gig.is_active
                                ? BrandColors.primary
                                : BrandColors.gray600,
                            },
                          ]}
                        >
                          {gig.is_active ? t("active") : t("paused")}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                      {gig.title}
                    </Text>

                    <View style={styles.gigStats}>
                      <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                          <Star
                            size={14}
                            fill={BrandColors.secondary}
                            color={BrandColors.secondary}
                          />
                        </View>
                        <Text style={[styles.statText, { color: theme.secondaryText }]}>
                          {gig.rating || 0} ({gig.reviews_count || 0})
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                          <Eye size={14} color={BrandColors.primary} />
                        </View>
                        <Text style={[styles.statText, { color: theme.secondaryText }]}>0</Text>
                      </View>
                      <View style={styles.statItem}>
                        <View style={styles.statIconBg}>
                          <TrendingUp size={14} color={BrandColors.accent} />
                        </View>
                        <Text style={[styles.statText, { color: theme.secondaryText }]}>
                          {gig.orders_count || 0} {t("orders")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.gigFooter}>
                      <View>
                        <Text style={[styles.priceLabel, { color: theme.tertiaryText }]}>{t("startingAt")}</Text>
                        <Text style={[styles.gigPrice, { color: theme.text }]}>
                          {startingPrice} SAR
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.editQuickButton}
                        onPress={() => handleEditGig(gig.id)}
                      >
                        <Edit3 size={16} color={BrandColors.primary} strokeWidth={2.5} />
                        <Text style={styles.editQuickButtonText}>{t("edit")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Modal
                    visible={selectedGig === gig.id}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setSelectedGig(null)}
                  >
                    <TouchableOpacity
                      style={styles.modalOverlay}
                      activeOpacity={1}
                      onPress={() => setSelectedGig(null)}
                    >
                      <View style={[styles.menuModal, { backgroundColor: theme.card }]}>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handlePreviewGig(gig.id)}
                        >
                          <View style={[styles.menuIcon, { backgroundColor: BrandColors.accent + "15" }]}>
                            <ExternalLink size={18} color={BrandColors.accent} />
                          </View>
                          <Text style={[styles.menuText, { color: theme.text }]}>{t("preview Gig")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleEditGig(gig.id)}
                        >
                          <View style={[styles.menuIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                            <Edit3 size={18} color={BrandColors.primary} />
                          </View>
                          <Text style={[styles.menuText, { color: theme.text }]}>{t("edit Gig")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleToggleStatus(gig.id, gig.is_active)}
                        >
                          {gig.is_active ? (
                            <>
                              <View style={[styles.menuIcon, { backgroundColor: BrandColors.warning + "15" }]}>
                                <Pause size={18} color={BrandColors.warning} />
                              </View>
                              <Text style={[styles.menuText, { color: theme.text }]}>{t("pause Gig")}</Text>
                            </>
                          ) : (
                            <>
                              <View style={[styles.menuIcon, { backgroundColor: BrandColors.success + "15" }]}>
                                <Play size={18} color={BrandColors.success} />
                              </View>
                              <Text style={[styles.menuText, { color: theme.text }]}>{t("activate Gig")}</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleDeleteGig(gig.id)}
                        >
                          <View style={[styles.menuIcon, { backgroundColor: BrandColors.error + "15" }]}>
                            <Trash2 size={18} color={BrandColors.error} />
                          </View>
                          <Text style={[styles.menuText, { color: BrandColors.error }]}>
                            {t("delete Gig")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </View>
              );
            })
          )}
        </View>

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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 20,
  },
  createEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  createEmptyButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
    marginRight: 16,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  gigCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  gigThumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: BrandColors.gray200,
  },
  moreButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  gigContent: {
    padding: 16,
  },
  gigHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gigTitle: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    lineHeight: 22,
    marginBottom: 14,
  },
  gigStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.neutralLight,
    alignItems: "center",
    justifyContent: "center",
  },
  statText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: BrandColors.gray700,
  },
  gigFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200 + "50",
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gigPrice: {
    fontSize: 20,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
  },
  editQuickButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "10",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  editQuickButtonText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  menuModal: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 8,
    minWidth: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  bottomPadding: {
    height: 40,
  },
});
