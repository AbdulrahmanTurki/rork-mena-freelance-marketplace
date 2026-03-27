import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useRouter } from "expo-router";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  CreditCard,
  Building2,
  Wallet,
  ChevronRight,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

export default function SellerEarnings() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const earningsData = {
    totalEarnings: 12450,
    monthlyEarnings: 3200,
    pendingClearance: 850,
    availableForWithdraw: 2350,
    inProgress: 680,
    platformFee: 15,
  };

  const recentTransactions = [
    {
      id: "1",
      type: "earning" as const,
      amount: 300,
      description: "Logo design for tech startup",
      date: "2024-01-20",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "earning" as const,
      amount: 600,
      description: "Brand identity package",
      date: "2024-01-18",
      status: "pending" as const,
    },
    {
      id: "3",
      type: "withdrawal" as const,
      amount: 2000,
      description: "Withdrawal to bank account",
      date: "2024-01-15",
      status: "completed" as const,
    },
    {
      id: "4",
      type: "earning" as const,
      amount: 150,
      description: "Social media graphics",
      date: "2024-01-12",
      status: "completed" as const,
    },
  ];

  const withdrawalMethods = [
    {
      id: "bank",
      name: t("bankTransfer"),
      icon: Building2,
      description: t("3to5BusinessDays"),
      available: true,
    },
    {
      id: "card",
      name: t("debitCard"),
      icon: CreditCard,
      description: t("instantTransfer"),
      available: true,
    },
    {
      id: "wallet",
      name: t("digitalWallet"),
      icon: Wallet,
      description: t("stcPayFawry"),
      available: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return BrandColors.success;
      case "pending":
        return BrandColors.warning;
      default:
        return BrandColors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return t("completed");
      case "pending":
        return t("pending");
      default:
        return status;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t("earnings"),
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIconContainer}>
              <DollarSign size={32} color={BrandColors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>{t("availableBalance")}</Text>
              <Text style={[styles.balanceAmount, { color: theme.text }]}>
                {earningsData.availableForWithdraw.toLocaleString()} SAR
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => setShowWithdrawModal(true)}
          >
            <ArrowUpRight size={20} color={BrandColors.white} strokeWidth={2.5} />
            <Text style={styles.withdrawButtonText}>{t("withdrawFunds")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
              <TrendingUp size={20} color={BrandColors.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>{t("totalEarnings")}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{earningsData.totalEarnings.toLocaleString()} SAR</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF8E1" }]}>
              <Clock size={20} color={BrandColors.secondary} strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>{t("pendingClearance")}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{earningsData.pendingClearance.toLocaleString()} SAR</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
              <DollarSign size={20} color="#2196F3" strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>{t("thisMonth")}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{earningsData.monthlyEarnings.toLocaleString()} SAR</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: BrandColors.primary + "15" }]}>
              <CheckCircle size={20} color={BrandColors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.statLabel}>{t("in Progress")}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{earningsData.inProgress.toLocaleString()} SAR</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("recentTransactions")}</Text>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: theme.card }]}>
              <View
                style={[
                  styles.transactionIcon,
                  {
                    backgroundColor:
                      transaction.type === "earning"
                        ? BrandColors.success + "15"
                        : BrandColors.accent + "15",
                  },
                ]}
              >
                {transaction.type === "earning" ? (
                  <ArrowUpRight
                    size={20}
                    color={BrandColors.success}
                    strokeWidth={2.5}
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                ) : (
                  <ArrowUpRight size={20} color={BrandColors.accent} strokeWidth={2.5} />
                )}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, { color: theme.text }]} numberOfLines={1}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(transaction.status) + "15",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(transaction.status) },
                      ]}
                    >
                      {getStatusText(transaction.status)}
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color:
                      transaction.type === "earning"
                        ? BrandColors.success
                        : BrandColors.accent,
                  },
                ]}
              >
                {transaction.type === "earning" ? "+" : "-"}
                {transaction.amount.toLocaleString()} SAR
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t("withdrawFunds")}</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.withdrawInfo}>
              <Text style={styles.withdrawLabel}>{t("availableBalance")}</Text>
              <Text style={styles.withdrawAmount}>
                {earningsData.availableForWithdraw.toLocaleString()} SAR
              </Text>
              <Text style={styles.withdrawFee}>
                {t("platformFee")}: {earningsData.platformFee}%
              </Text>
            </View>

            <Text style={styles.methodsTitle}>{t("selectMethod")}</Text>
            {withdrawalMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    { backgroundColor: theme.background },
                    !method.available && styles.methodCardDisabled,
                  ]}
                  disabled={!method.available}
                  onPress={() => {
                    console.log("Selected method:", method.id);
                    setShowWithdrawModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      {
                        backgroundColor: method.available
                          ? BrandColors.primary + "15"
                          : BrandColors.gray200,
                      },
                    ]}
                  >
                    <IconComponent
                      size={24}
                      color={method.available ? BrandColors.primary : BrandColors.gray400}
                      strokeWidth={2}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text
                      style={[
                        styles.methodName,
                        { color: theme.text },
                        !method.available && styles.methodNameDisabled,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text
                      style={[
                        styles.methodDescription,
                        !method.available && styles.methodDescriptionDisabled,
                      ]}
                    >
                      {method.description}
                    </Text>
                  </View>
                  {method.available && (
                    <ChevronRight size={20} color={BrandColors.gray400} />
                  )}
                  {!method.available && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>{t("comingSoon")}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: BrandColors.white,
    margin: 20,
    padding: 24,
    borderRadius: 24,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: BrandColors.primary + "20",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 16,
  },
  balanceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -1,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.white,
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
    padding: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginBottom: 6,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray500,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BrandColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900" as const,
    color: BrandColors.neutralDark,
    letterSpacing: -0.5,
  },
  modalClose: {
    fontSize: 28,
    fontWeight: "300" as const,
    color: BrandColors.gray500,
  },
  withdrawInfo: {
    backgroundColor: BrandColors.primary + "10",
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  withdrawLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  withdrawAmount: {
    fontSize: 36,
    fontWeight: "900" as const,
    color: BrandColors.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  withdrawFee: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.neutralLight,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
  },
  methodCardDisabled: {
    opacity: 0.6,
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "800" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  methodNameDisabled: {
    color: BrandColors.gray600,
  },
  methodDescription: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  methodDescriptionDisabled: {
    color: BrandColors.gray500,
  },
  comingSoonBadge: {
    backgroundColor: BrandColors.secondary + "20",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: "800" as const,
    color: BrandColors.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 40,
  },
});
