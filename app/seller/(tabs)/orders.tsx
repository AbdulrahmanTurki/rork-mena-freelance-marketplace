import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Clock, ChevronRight, AlertCircle, Package } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";

export default function SellerOrders() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"active" | "completed" | "cancelled">("active");

  const { data: orders = [], isLoading } = useOrders({ sellerId: user?.id });

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "pending_payment" ||
        order.status === "in_progress" ||
        order.status === "delivered" ||
        order.status === "revision_requested"
    );
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((order) => order.status === "completed");
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter((order) => order.status === "cancelled");
  }, [orders]);

  const calculateTimeLeft = (targetDate: string | null | undefined) => {
    if (!targetDate) return null;
    const now = new Date();
    const due = new Date(targetDate);
    if (Number.isNaN(due.getTime())) return null;
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    return { hours: diffHours, days: diffDays };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return BrandColors.primary;
      case "pending_payment":
        return BrandColors.secondary;
      case "delivered":
        return BrandColors.success;
      case "revision_requested":
        return BrandColors.accent;
      default:
        return BrandColors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return t("in Progress");
      case "pending_payment":
        return t("pending Payment");
      case "delivered":
        return t("delivered");
      case "revision_requested":
        return t("revision Requested");
      default:
        return status;
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 1) return BrandColors.error;
    if (days <= 3) return BrandColors.warning;
    return BrandColors.success;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "revision_requested":
        return <AlertCircle size={14} color={BrandColors.accent} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("manage Orders"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.tabsContainer, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: selectedTab === "active" ? BrandColors.primary : theme.inputBackground },
            selectedTab === "active" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === "active" ? BrandColors.white : theme.secondaryText },
              selectedTab === "active" && styles.activeTabText,
            ]}
          >
            {t("active")}
          </Text>
          {activeOrders.length > 0 && (
            <View style={[styles.badge, selectedTab === "active" && styles.activeBadge]}>
              <Text style={[styles.badgeText, selectedTab === "active" && styles.activeBadgeText]}>
                {activeOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: selectedTab === "completed" ? BrandColors.primary : theme.inputBackground },
            selectedTab === "completed" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === "completed" ? BrandColors.white : theme.secondaryText },
              selectedTab === "completed" && styles.activeTabText,
            ]}
          >
            {t("completed")}
          </Text>
          {completedOrders.length > 0 && (
            <View style={[styles.badge, selectedTab === "completed" && styles.activeBadge]}>
              <Text style={[styles.badgeText, selectedTab === "completed" && styles.activeBadgeText]}>
                {completedOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: selectedTab === "cancelled" ? BrandColors.primary : theme.inputBackground },
            selectedTab === "cancelled" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("cancelled")}
        >
          <Text
            style={[
              styles.tabText,
              { color: selectedTab === "cancelled" ? BrandColors.white : theme.secondaryText },
              selectedTab === "cancelled" && styles.activeTabText,
            ]}
          >
            {t("cancelled")}
          </Text>
          {cancelledOrders.length > 0 && (
            <View style={[styles.badge, selectedTab === "cancelled" && styles.activeBadge]}>
              <Text style={[styles.badgeText, selectedTab === "cancelled" && styles.activeBadgeText]}>
                {cancelledOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>{t("loading")}</Text>
            </View>
          ) : selectedTab === "active" ? (
            <>
              {activeOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Package size={48} color={BrandColors.gray400} />
                  <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                    {t("no Active Orders")}
                  </Text>
                </View>
              ) : (
                activeOrders.map((order) => {
                  const timeLeft = calculateTimeLeft(order.auto_release_at);
                  return (
                    <TouchableOpacity
                      key={order.id}
                      style={[styles.orderCard, { backgroundColor: theme.card }]}
                      onPress={() => router.push(`/seller/order/${order.id}` as any)}
                    >
                      <View style={styles.orderHeader}>
                        <Image
                          source={{ uri: order.buyer?.avatar_url || "https://i.pravatar.cc/300?img=1" }}
                          style={styles.buyerAvatar}
                        />
                        <View style={styles.orderHeaderInfo}>
                          <View style={styles.headerTopRow}>
                            <Text style={[styles.buyerName, { color: theme.text }]}>
                              {order.buyer?.full_name || "Buyer"}
                            </Text>
                          </View>
                          <Text style={[styles.gigTitle, { color: theme.secondaryText }]} numberOfLines={1}>
                            {order.gig?.title || "Service"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderBody}>
                        <View style={styles.orderMeta}>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusColor(order.status) + "15" },
                            ]}
                          >
                            {getStatusIcon(order.status)}
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusColor(order.status) },
                              ]}
                            >
                              {getStatusText(order.status)}
                            </Text>
                          </View>

                          {timeLeft && timeLeft.hours > 0 && (
                            <View style={[styles.dueInfo, { backgroundColor: getDaysLeftColor(timeLeft.days) + "15" }]}>
                              <Clock size={14} color={getDaysLeftColor(timeLeft.days)} />
                              <Text
                                style={[
                                  styles.dueText,
                                  { color: getDaysLeftColor(timeLeft.days) },
                                ]}
                              >
                                {timeLeft.hours}h {t("left")}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.orderFooter}>
                        <Text style={[styles.orderPrice, { color: theme.text }]}>SAR {order.gig_price}</Text>
                        <View style={styles.viewButton}>
                          <Text style={styles.viewButtonText}>{t("view Details")}</Text>
                          <ChevronRight size={16} color={BrandColors.primary} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : selectedTab === "completed" ? (
            <>
              {completedOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Package size={48} color={BrandColors.gray400} />
                  <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                    {t("no Completed Orders")}
                  </Text>
                </View>
              ) : (
                completedOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push(`/seller/order/${order.id}` as any)}
                  >
                    <View style={styles.orderHeader}>
                      <Image
                        source={{ uri: order.buyer?.avatar_url || "https://i.pravatar.cc/300?img=1" }}
                        style={styles.buyerAvatar}
                      />
                      <View style={styles.orderHeaderInfo}>
                        <Text style={[styles.buyerName, { color: theme.text }]}>
                          {order.buyer?.full_name || "Buyer"}
                        </Text>
                        <Text style={[styles.gigTitle, { color: theme.secondaryText }]} numberOfLines={1}>
                          {order.gig?.title || "Service"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderBody}>
                      <View style={styles.completedMeta}>
                        <View style={styles.completedInfo}>
                          <Text style={[styles.completedLabel, { color: theme.tertiaryText }]}>{t("completed")}</Text>
                          <Text style={[styles.completedDate, { color: theme.secondaryText }]}>
                            {order.completed_at ? new Date(order.completed_at).toLocaleDateString() : ""}
                          </Text>
                        </View>

                      </View>
                    </View>

                    <View style={styles.orderFooter}>
                      <Text style={[styles.orderPrice, { color: theme.text }]}>SAR {order.gig_price}</Text>
                      <View style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>{t("view Details")}</Text>
                        <ChevronRight size={16} color={BrandColors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          ) : (
            <>
              {cancelledOrders.length === 0 ? (
                <View style={styles.emptyState}>
                  <Package size={48} color={BrandColors.gray400} />
                  <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
                    {t("no Cancelled Orders")}
                  </Text>
                </View>
              ) : (
                cancelledOrders.map((order) => (
                  <TouchableOpacity
                    key={order.id}
                    style={[styles.orderCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push(`/seller/order/${order.id}` as any)}
                  >
                    <View style={styles.orderHeader}>
                      <Image
                        source={{ uri: order.buyer?.avatar_url || "https://i.pravatar.cc/300?img=1" }}
                        style={styles.buyerAvatar}
                      />
                      <View style={styles.orderHeaderInfo}>
                        <Text style={[styles.buyerName, { color: theme.text }]}>
                          {order.buyer?.full_name || "Buyer"}
                        </Text>
                        <Text style={[styles.gigTitle, { color: theme.secondaryText }]} numberOfLines={1}>
                          {order.gig?.title || "Service"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderBody}>
                      <View style={styles.completedMeta}>
                        <View style={styles.completedInfo}>
                          <Text style={[styles.completedLabel, { color: theme.tertiaryText }]}>{t("cancelled")}</Text>
                          <Text style={[styles.completedDate, { color: theme.secondaryText }]}>
                            {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : ""}
                          </Text>
                        </View>
                      </View>

                    </View>

                    <View style={styles.orderFooter}>
                      <Text style={[styles.orderPrice, { color: theme.text }]}>SAR {order.gig_price}</Text>
                      <View style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>{t("view Details")}</Text>
                        <ChevronRight size={16} color={BrandColors.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
  },
  activeTab: {
    backgroundColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: BrandColors.gray600,
  },
  activeTabText: {
    color: BrandColors.white,
  },
  badge: {
    backgroundColor: BrandColors.gray300,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  activeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900" as const,
    color: BrandColors.gray700,
  },
  activeBadgeText: {
    color: BrandColors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: BrandColors.white,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  buyerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
  },
  orderHeaderInfo: {
    flex: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  gigTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: BrandColors.gray600,
  },
  orderBody: {
    marginBottom: 14,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800" as const,
  },
  dueInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  dueText: {
    fontSize: 12,
    fontWeight: "800" as const,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "10",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  completedMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedInfo: {
    gap: 4,
  },
  completedLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  completedDate: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.gray700,
  },

  cancelReason: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: BrandColors.gray600,
    marginTop: 8,
    fontStyle: "italic" as const,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 16,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
});
