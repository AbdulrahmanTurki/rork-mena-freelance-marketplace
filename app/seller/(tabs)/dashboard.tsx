import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useGigs } from "@/hooks/useGigs";
import { useOrders } from "@/hooks/useOrders";
import { useSellerWallet } from "@/hooks/useWallet";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  DollarSign,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  Package,
  ChevronRight,
  Eye,
  MessageCircle,
  Sparkles,
  Plus,
  Globe,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";


export default function SellerDashboard() {
  const { t, language, changeLanguage } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const { data: wallet, isLoading: walletLoading, error: walletError } = useSellerWallet();
  const { data: myGigs, isLoading: gigsLoading } = useGigs({ sellerId: user?.id });
  const { data: allOrders, isLoading: ordersLoading } = useOrders({ sellerId: user?.id });

  const handleLanguageToggle = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  const stats = useMemo(() => {
    const activeOrders = allOrders?.filter(o => 
      o.status === 'in_progress' || o.status === 'pending_delivery' || o.status === 'revision_requested'
    ).length || 0;
    const completedOrders = allOrders?.filter(o => o.status === 'completed').length || 0;

    const avgRating = myGigs && myGigs.length > 0
      ? myGigs.reduce((sum, gig) => sum + (gig.rating || 0), 0) / myGigs.length
      : 0;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyOrders = allOrders?.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= thisMonth && o.status === 'completed';
    }) || [];

    const monthlyEarnings = monthlyOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

    return {
      totalEarnings: wallet?.total_earned || 0,
      monthlyEarnings,
      activeOrders,
      completedOrders,
      rating: avgRating ? Number(avgRating.toFixed(1)) : 0,
      responseTime: "2h",
      deliveryOnTime: 98,
    };
  }, [wallet, myGigs, allOrders]);

  const recentOrders = useMemo(() => {
    if (!allOrders) return [];

    return allOrders
      .filter(o => o.status === 'in_progress' || o.status === 'pending_delivery' || o.status === 'revision_requested')
      .slice(0, 3)
      .map(order => {
        const dueDate = new Date(order.due_date);
        const now = new Date();
        const hoursLeft = Math.max(0, Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)));

        return {
          id: order.id,
          buyerName: order.buyer?.full_name || 'Unknown',
          buyerAvatar: order.buyer?.avatar_url || 'https://i.pravatar.cc/300',
          gigTitle: order.gig_title || 'Untitled',
          price: order.total_amount || 0,
          status: order.status,
          dueDate: order.due_date,
          hoursLeft,
        };
      });
  }, [allOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return BrandColors.primary;
      case "pending_delivery":
        return BrandColors.secondary;
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
      case "pending_delivery":
        return t("pending Delivery");
      case "revision_requested":
        return t("revision Requested");
      default:
        return status;
    }
  };

  const isLoading = walletLoading || gigsLoading || ordersLoading;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (walletError) {
    console.error('[Dashboard] Wallet Error:', walletError);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: theme.inputBackground }]}
              onPress={handleLanguageToggle}
            >
              <Globe size={20} color={BrandColors.primary} />
              <Text style={[styles.languageText, { color: BrandColors.primary }]}>
                {language === "en" ? "AR" : "EN"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.earningsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.earningsHeader}>
            <View style={styles.earningsLeft}>
              <Text style={[styles.earningsLabel, { color: theme.secondaryText }]}>{t("totalEarnings")}</Text>
              <Text style={[styles.earningsAmount, { color: theme.text }]}>{stats.totalEarnings.toLocaleString()} SAR</Text>
              <View style={styles.monthlyRow}>
                <View style={styles.monthlyBadge}>
                  <Text style={styles.monthlyLabel}>{t("thisMonth")}</Text>
                  <Text style={styles.monthlyAmount}>
                    {stats.monthlyEarnings.toLocaleString()} SAR
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.earningsBadge}>
              <Sparkles size={28} color={BrandColors.secondary} fill={BrandColors.secondary} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => router.push("/seller/earnings" as any)}
          >
            <DollarSign size={18} color={BrandColors.primary} strokeWidth={2.5} />
            <Text style={styles.withdrawButtonText}>{t("view Earnings")}</Text>
            <ChevronRight size={18} color={BrandColors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <ShoppingBag size={22} color={BrandColors.success} strokeWidth={2.5} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.activeOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("active Orders")}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF8E1" }]}>
              <Package size={22} color={BrandColors.secondary} strokeWidth={2.5} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.completedOrders}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("completed")}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#FCE4EC" }]}>
              <Star size={22} color={BrandColors.accent} fill={BrandColors.accent} strokeWidth={2.5} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.rating}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("rating")}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <Clock size={22} color="#2196F3" strokeWidth={2.5} />
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.responseTime}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("responseTime")}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("quick Actions")}</Text>
            <Eye size={20} color={BrandColors.gray500} />
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/create-gig" as any)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: BrandColors.primary + "15" }]}
              >
                <Plus size={26} color={BrandColors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>{t("create Gig")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/earnings" as any)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: "#2196F3" + "15" }]}
              >
                <DollarSign size={26} color="#2196F3" strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>{t("view Earnings")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/edit-profile" as any)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: BrandColors.secondary + "15" }]}
              >
                <Star size={26} color={BrandColors.secondary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>{t("edit Profile")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card }]}
              onPress={() => router.push("/seller/settings" as any)}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: BrandColors.accent + "15" }]}
              >
                <TrendingUp size={26} color={BrandColors.accent} strokeWidth={2.5} />
              </View>
              <Text style={[styles.actionText, { color: theme.text }]}>{t("settings")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("recent Orders")}</Text>
            <TouchableOpacity onPress={() => router.push("/seller/(tabs)/orders" as any)}>
              <Text style={styles.viewAllText}>{t("viewAll")}</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, { backgroundColor: theme.card }]}
              onPress={() => router.push(`/seller/order/${order.id}` as any)}
            >
              <Image
                source={{ uri: order.buyerAvatar }}
                style={styles.buyerAvatar}
              />
              <View style={styles.orderInfo}>
                <View style={styles.orderHeaderRow}>
                  <Text style={[styles.buyerName, { color: theme.text }]}>{order.buyerName}</Text>
                  <View style={styles.messageBadge}>
                    <MessageCircle size={14} color={BrandColors.white} />
                  </View>
                </View>
                <Text style={[styles.orderGigTitle, { color: theme.secondaryText }]} numberOfLines={1}>
                  {order.gigTitle}
                </Text>
                <View style={styles.orderMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + "15" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  <View style={styles.timeInfo}>
                    <Clock size={12} color={BrandColors.gray500} />
                    <Text style={styles.timeText}>
                      {order.hoursLeft}h {t("left")}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.orderRight}>
                <Text style={[styles.orderPrice, { color: theme.text }]}>{order.price} SAR</Text>
                <ChevronRight size={20} color={BrandColors.gray400} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.performanceCard, { backgroundColor: theme.card }]}>
          <View style={styles.performanceHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("performance")}</Text>
            <TouchableOpacity onPress={() => router.push("/seller/(tabs)/analytics" as any)}>
              <Text style={styles.viewAllText}>{t("details")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.performanceMetrics}>
            <View style={styles.performanceItem}>
              <View style={styles.performanceRow}>
                <View style={styles.performanceLabelRow}>
                  <View style={styles.performanceIconSmall}>
                    <TrendingUp size={14} color={BrandColors.primary} />
                  </View>
                  <Text style={[styles.performanceLabel, { color: theme.secondaryText }]}>
                    {t("on Time Delivery")}
                  </Text>
                </View>
                <Text style={[styles.performanceValue, { color: BrandColors.primary }]}>
                  {stats.deliveryOnTime}%
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${stats.deliveryOnTime}%`, backgroundColor: BrandColors.primary },
                  ]}
                />
              </View>
            </View>
          </View>
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
  earningsCard: {
    backgroundColor: BrandColors.white,
    margin: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary + "10",
  },
  earningsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  earningsLeft: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    marginBottom: 12,
    letterSpacing: -1,
  },
  monthlyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthlyBadge: {
    backgroundColor: BrandColors.primary + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthlyLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  monthlyAmount: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: BrandColors.primary,
  },
  earningsBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BrandColors.secondary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.primary + "10",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  withdrawButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: BrandColors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
    textAlign: "center",
  },
  quickActions: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: BrandColors.white,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    textAlign: "center",
  },
  ordersSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  orderCard: {
    flexDirection: "row",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  buyerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
  },
  orderInfo: {
    flex: 1,
  },
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 15,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
  },
  messageBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  orderGigTitle: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: BrandColors.gray600,
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800" as const,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
  },
  orderRight: {
    alignItems: "flex-end",
    marginLeft: 12,
    gap: 4,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
  },
  performanceCard: {
    marginTop: 28,
    marginHorizontal: 20,
    backgroundColor: BrandColors.white,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  performanceMetrics: {
    gap: 16,
  },
  performanceItem: {
    gap: 12,
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  performanceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  performanceIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.gray700,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: "900" as const,
    color: BrandColors.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: BrandColors.gray200,
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  bottomPadding: {
    height: 40,
  },
  languageButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BrandColors.gray100,
    borderRadius: 20,
    marginRight: 8,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
});
