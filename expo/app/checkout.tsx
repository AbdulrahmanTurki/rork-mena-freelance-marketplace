import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, CreditCard, Wallet } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from "react-native";

type PaymentMethod = "card" | "wallet";

export default function CheckoutScreen() {
  const { gigId, packageType, price, packageName } = useLocalSearchParams();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCVC) {
        Alert.alert(t("error"), "Please fill in all card details");
        return;
      }
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        t("success"),
        "Payment successful! Order has been placed.",
        [
          {
            text: t("ok"),
            onPress: () => router.push("/order/new-order-id" as any),
          },
        ]
      );
    }, 2000);
  };

  const totalPrice = Number(price) || 0;
  const serviceFee = totalPrice * 0.1;
  const finalPrice = totalPrice + serviceFee;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("checkout"),
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.orderSummaryCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("orderSummary")}</Text>
            <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>{t("package")}</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {packageName || packageType || "Standard"}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>{t("price")}</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{totalPrice} SAR</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>{t("serviceFee")}</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{serviceFee.toFixed(2)} SAR</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>{t("total")}</Text>
              <Text style={[styles.totalValue, { color: BrandColors.primary }]}>
                {finalPrice.toFixed(2)} SAR
              </Text>
            </View>
          </View>

          <View style={[styles.paymentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("paymentMethod")}</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentOption,
                { 
                  backgroundColor: paymentMethod === "card" ? BrandColors.primary + "15" : theme.inputBackground,
                  borderColor: paymentMethod === "card" ? BrandColors.primary : theme.border,
                }
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: BrandColors.primary + "20" }]}>
                  <CreditCard size={24} color={BrandColors.primary} />
                </View>
                <View>
                  <Text style={[styles.paymentOptionTitle, { color: theme.text }]}>
                    {t("creditDebitCard")}
                  </Text>
                  <Text style={[styles.paymentOptionDesc, { color: theme.secondaryText }]}>
                    {t("payWithCard")}
                  </Text>
                </View>
              </View>
              {paymentMethod === "card" && (
                <CheckCircle2 size={24} color={BrandColors.primary} fill={BrandColors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOption,
                { 
                  backgroundColor: paymentMethod === "wallet" ? BrandColors.primary + "15" : theme.inputBackground,
                  borderColor: paymentMethod === "wallet" ? BrandColors.primary : theme.border,
                }
              ]}
              onPress={() => setPaymentMethod("wallet")}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: BrandColors.secondary + "20" }]}>
                  <Wallet size={24} color={BrandColors.secondary} />
                </View>
                <View>
                  <Text style={[styles.paymentOptionTitle, { color: theme.text }]}>
                    {t("wallet")}
                  </Text>
                  <Text style={[styles.paymentOptionDesc, { color: theme.secondaryText }]}>
                    {t("payWithWallet")}
                  </Text>
                </View>
              </View>
              {paymentMethod === "wallet" && (
                <CheckCircle2 size={24} color={BrandColors.primary} fill={BrandColors.primary} />
              )}
            </TouchableOpacity>

            {paymentMethod === "card" && (
              <View style={styles.cardForm}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>
                    {t("cardNumber")}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.tertiaryText}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    keyboardType="number-pad"
                    maxLength={19}
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>
                      {t("expiryDate")}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.tertiaryText}
                      value={cardExpiry}
                      onChangeText={setCardExpiry}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>

                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: theme.secondaryText }]}>
                      {t("cvc")}
                    </Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
                      placeholder="123"
                      placeholderTextColor={theme.tertiaryText}
                      value={cardCVC}
                      onChangeText={setCardCVC}
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.checkoutButton, { opacity: isProcessing ? 0.6 : 1 }]}
            onPress={handleCheckout}
            disabled={isProcessing}
          >
            <Text style={styles.checkoutButtonText}>
              {isProcessing ? t("processing") : `${t("payNow")} ${finalPrice.toFixed(2)} SAR`}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Text style={[styles.securityText, { color: theme.secondaryText }]}>
              {t("securePayment")}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  orderSummaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800" as const,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "900" as const,
  },
  paymentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
  cardForm: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "600" as const,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  checkoutButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: BrandColors.white,
  },
  securityNote: {
    alignItems: "center",
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 13,
    fontWeight: "500" as const,
    textAlign: "center",
  },
});
