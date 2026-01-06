import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useOrders, type OrderWithDetails } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Calendar, Clock, Package, ShoppingBag, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

type TabType = "active" | "completed" | "cancelled";

export default function OrdersScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>("active");

  const { data: allOrders, isLoading, error } = useOrders();

  const { activeOrders, completedOrders, cancelledOrders } = useMemo(() => {
    if (!allOrders) return { activeOrders: [], completedOrders: [], cancelledOrders: [] };
    
    return {
      activeOrders: allOrders.filter(order => 
        order.status === 'pending_payment' || 
        order.status === 'in_progress' || 
        order.status === 'delivered' ||
        order.status === 'revision_requested'
      ),
      completedOrders: allOrders.filter(order => order.status === 'completed'),
      cancelledOrders: allOrders.filter(order => order.status === 'cancelled'),
    };
  }, [allOrders]);

  const getCurrentOrders = () => {
    switch (selectedTab) {
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
      case "pending_payment":
        return BrandColors.primary;
      case "delivered":
        return BrandColors.secondary;
      case "completed":
        return BrandColors.success;
      case "cancelled":
        return BrandColors.error;
      case "revision_requested":
        return "#FF9500";
      default:
        return BrandColors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_payment":
        return t("pendingPayment") || "Pending Payment";
      case "in_progress":
        return t("inProgress");
      case "delivered":
        return t("delivered");
      case "completed":
        return t("completed");
      case "cancelled":
        return t("cancelled");
      case "revision_requested":
        return t("revisionRequested") || "Revision Requested";
      default:
        return status;
    }
  };

  const renderOrderCard = ({ item }: { item: OrderWithDetails }) => {
    if (!item.gig) return null;
    
    const otherUser = user?.id === item.buyer_id ? item.seller : item.buyer;
    if (!otherUser) return null;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: theme.card }]}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        <View style={styles.orderHeader}>
          <Image 
            source={{ uri: item.gig.images?.[0] || 'https://via.placeholder.com/80' }} 
            style={styles.gigThumbnail} 
            contentFit="cover"
          />
          <View style={styles.orderHeaderInfo}>
            <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
              {item.gig.title}
            </Text>
            <View style={styles.freelancerInfo}>
              <Image
                source={{ uri: otherUser.avatar_url || 'https://via.placeholder.com/24' }}
                style={styles.smallAvatar}
                contentFit="cover"
              />
              <Text style={styles.freelancerName}>
                {otherUser.full_name || 'User'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.orderDetails, { borderTopColor: theme.border }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={BrandColors.gray500} />
              <Text style={styles.detailLabel}>{t("orderPlaced")}</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Clock size={16} color={BrandColors.gray500} />
              <Text style={styles.detailLabel}>{t("orderNumber") || "Order #"}</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {item.order_number || item.id.slice(0, 8)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Package size={16} color={BrandColors.gray500} />
              <Text style={styles.detailLabel}>{t("status")}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.orderFooter, { borderTopColor: theme.border }]}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>{t("total")}</Text>
            <Text style={[styles.totalPrice, { color: theme.text }]}>SAR {item.gig_price}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/order/${item.id}` as any)}
          >
            <Text style={styles.viewButtonText}>{t("viewOrder")}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        {selectedTab === "cancelled" ? (
          <X size={64} color={BrandColors.gray300} />
        ) : (
          <ShoppingBag size={64} color={BrandColors.gray300} />
        )}
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>{t("noOrders")}</Text>
      <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>{t("browseServices")}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("orders"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />

      <View style={[styles.tabsContainer, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <TouchableOpacity
            style={[styles.tab, { backgroundColor: theme.inputBackground }, selectedTab === "active" && styles.activeTab]}
            onPress={() => setSelectedTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.secondaryText },
                selectedTab === "active" && styles.activeTabText,
              ]}
            >
              {t("active")} ({activeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: theme.inputBackground },
              selectedTab === "completed" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.secondaryText },
                selectedTab === "completed" && styles.activeTabText,
              ]}
            >
              {t("completed")} ({completedOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              { backgroundColor: theme.inputBackground },
              selectedTab === "cancelled" && styles.activeTab,
            ]}
            onPress={() => setSelectedTab("cancelled")}
          >
            <Text
              style={[
                styles.tabText,
                { color: theme.secondaryText },
                selectedTab === "cancelled" && styles.activeTabText,
              ]}
            >
              {t("cancelled")} ({cancelledOrders.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
            {t("loading") || "Loading orders..."}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: BrandColors.error }]}>
            {t("errorLoadingOrders") || "Error loading orders"}
          </Text>
          <Text style={[styles.errorDetail, { color: theme.secondaryText }]}>
            {error instanceof Error ? error.message : JSON.stringify(error)}
          </Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentOrders()}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            getCurrentOrders().length === 0
              ? styles.emptyContainer
              : styles.listContainer
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  tabsContainer: {
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: BrandColors.gray100,
  },
  activeTab: {
    backgroundColor: BrandColors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  activeTabText: {
    color: BrandColors.white,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  gigThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: BrandColors.gray200,
  },
  orderHeaderInfo: {
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
  freelancerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  freelancerName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  orderDetails: {
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
  },
  priceContainer: {
    gap: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  viewButton: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewButtonText: {
    fontSize: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: BrandColors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.error,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 14,
    color: BrandColors.gray600,
    textAlign: "center",
  },
});
