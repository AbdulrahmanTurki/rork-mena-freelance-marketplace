import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import {
  TrendingUp,
  Eye,
  ShoppingBag,
  DollarSign,
  Star,
  Clock,
  BarChart3,
  Package,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useGigs } from "@/hooks/useGigs";

export default function SellerAnalytics() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useOrders({ sellerId: user?.id });
  const { data: gigs = [], isLoading: gigsLoading } = useGigs({ sellerId: user?.id });

  const isLoading = ordersLoading || gigsLoading;

  const stats = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const totalOrders = completedOrders.length;
    const activeGigs = gigs.filter((g) => g.status === "active").length;

    const ratings = completedOrders
      .filter((o) => o.rating)
      .map((o) => o.rating as number);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : "N/A";

    return {
      totalRevenue,
      totalOrders,
      activeGigs,
      avgRating,
    };
  }, [orders, gigs]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("analytics"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>{t("loading")}</Text>
        </View>
      ) : orders.length === 0 && gigs.length === 0 ? (
        <View style={styles.emptyState}>
          <BarChart3 size={64} color={BrandColors.gray400} strokeWidth={2} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
            {t("no Data Available")}
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.secondaryText }]}>
            {t("create Your First Gig To See Analytics")}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("overview")}</Text>
              <BarChart3 size={22} color={BrandColors.primary} strokeWidth={2.5} />
            </View>
            
            <View style={styles.metricsGrid}>
              <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
                <View style={[styles.metricIcon, { backgroundColor: "#E8F5E9" }]}>
                  <DollarSign size={22} color={BrandColors.success} strokeWidth={2.5} />
                </View>
                <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>
                  {t("total Revenue")}
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {stats.totalRevenue.toLocaleString()} SAR
                </Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
                <View style={[styles.metricIcon, { backgroundColor: "#E3F2FD" }]}>
                  <ShoppingBag size={22} color="#2196F3" strokeWidth={2.5} />
                </View>
                <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>
                  {t("completed Orders")}
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {stats.totalOrders}
                </Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
                <View style={[styles.metricIcon, { backgroundColor: "#FFF8E1" }]}>
                  <Star size={22} color={BrandColors.secondary} strokeWidth={2.5} />
                </View>
                <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>
                  {t("avg Rating")}
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {stats.avgRating}
                </Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card }]}>
                <View style={[styles.metricIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                  <Package size={22} color={BrandColors.primary} strokeWidth={2.5} />
                </View>
                <Text style={[styles.metricLabel, { color: theme.secondaryText }]}>
                  {t("active Gigs")}
                </Text>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {stats.activeGigs}
                </Text>
              </View>
            </View>

            {gigs.length > 0 && (
              <View style={[styles.topGigsCard, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {t("your Services")}
                  </Text>
                </View>
                {gigs.slice(0, 5).map((gig, index) => (
                  <View key={gig.id} style={styles.gigRow}>
                    <View
                      style={[
                        styles.gigRank,
                        {
                          backgroundColor:
                            index === 0
                              ? BrandColors.secondary + "20"
                              : BrandColors.primary + "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          {
                            color:
                              index === 0
                                ? BrandColors.secondary
                                : BrandColors.primary,
                          },
                        ]}
                      >
                        #{index + 1}
                      </Text>
                    </View>
                    <View style={styles.gigRowInfo}>
                      <Text style={[styles.gigRowTitle, { color: theme.text }]} numberOfLines={1}>
                        {gig.title}
                      </Text>
                      <View style={styles.gigRowStats}>
                        <View style={styles.statusDot}>
                          <View
                            style={[
                              styles.dot,
                              {
                                backgroundColor:
                                  gig.status === "active"
                                    ? BrandColors.success
                                    : BrandColors.gray400,
                              },
                            ]}
                          />
                          <Text style={styles.statusText}>
                            {gig.status === "active" ? t("active") : t("inactive")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: BrandColors.white,
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: BrandColors.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.primary,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
  },
  totalEarningsTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.primary + "10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  totalEarningsText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: BrandColors.primary,
  },
  chart: {
    flexDirection: "row",
    height: 180,
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    width: "100%",
    height: 140,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    backgroundColor: BrandColors.primary,
    borderRadius: 8,
    minHeight: 12,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: BrandColors.gray700,
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
    marginTop: 3,
  },
  topGigsCard: {
    backgroundColor: BrandColors.white,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 20,
  },
  gigRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
    gap: 14,
  },
  gigRank: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "900" as const,
  },
  gigRowInfo: {
    flex: 1,
  },
  gigRowTitle: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
  },
  gigRowStats: {
    flexDirection: "row",
    gap: 14,
  },
  statusDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: BrandColors.gray700,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: "500" as const,
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
});
