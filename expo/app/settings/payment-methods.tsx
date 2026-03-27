import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePaymentMethods, useUpdatePaymentMethod, useDeletePaymentMethod } from "@/hooks/usePaymentMethods";
import { Stack, useRouter } from "expo-router";
import { CreditCard, Plus, MoreVertical, Check } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

export default function PaymentMethodsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { data: paymentMethods, isLoading } = usePaymentMethods(user?.id);
  const updatePaymentMethod = useUpdatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();

  const handleAddCard = () => {
    router.push('/settings/add-payment-method' as any);
  };

  const handleSetAsDefault = async (id: string) => {
    if (!user?.id) return;
    
    try {
      await updatePaymentMethod.mutateAsync({
        id,
        userId: user.id,
        updates: { is_default: true },
      });
      Alert.alert("Success", "Default payment method updated");
    } catch (error) {
      console.error("Error setting default:", error);
      Alert.alert("Error", "Failed to update default payment method");
    }
  };

  const handleRemoveCard = async (id: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePaymentMethod.mutateAsync({ id, userId: user.id });
              Alert.alert("Success", "Payment method removed");
            } catch (error) {
              console.error("Error removing payment method:", error);
              Alert.alert("Error", "Failed to remove payment method");
            }
          },
        },
      ]
    );
  };

  const handleCardOptions = (id: string, isDefault: boolean) => {
    const options = [
      ...(!isDefault ? [{ text: "Set as Default", onPress: () => handleSetAsDefault(id) }] : []),
      { text: "Remove", style: "destructive" as const, onPress: () => handleRemoveCard(id) },
      { text: "Cancel", style: "cancel" as const },
    ];
    
    Alert.alert("Payment Method", "Choose an action", options);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Payment Methods",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.card, borderColor: BrandColors.primary }]}
          onPress={handleAddCard}
        >
          <Plus size={20} color={BrandColors.primary} />
          <Text style={[styles.addButtonText, { color: BrandColors.primary }]}>
            Add Payment Method
          </Text>
        </TouchableOpacity>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={[styles.loadingText, { color: theme.secondaryText }]}>Loading payment methods...</Text>
          </View>
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <View style={styles.methodsList}>
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              style={[
                styles.methodCard,
                { backgroundColor: theme.card, borderColor: method.is_default ? BrandColors.primary : theme.border },
              ]}
            >
              <View style={styles.methodLeft}>
                <View style={[styles.cardIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                  <CreditCard size={24} color={BrandColors.primary} />
                </View>
                <View>
                  <View style={styles.methodHeader}>
                    <Text style={[styles.methodBrand, { color: theme.text }]}>
                      {method.brand}
                    </Text>
                    {method.is_default && (
                      <View style={[styles.defaultBadge, { backgroundColor: BrandColors.success + "15" }]}>
                        <Check size={12} color={BrandColors.success} />
                        <Text style={[styles.defaultText, { color: BrandColors.success }]}>
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodNumber, { color: theme.secondaryText }]}>
                    •••• •••• •••• {method.last_four}
                  </Text>
                  <Text style={[styles.methodExpiry, { color: theme.tertiaryText }]}>
                    Expires {method.expiry_month}/{method.expiry_year}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => handleCardOptions(method.id, method.is_default)}
              >
                <MoreVertical size={20} color={theme.secondaryText} />
              </TouchableOpacity>
            </View>
          ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <CreditCard size={48} color={BrandColors.gray300} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No payment methods added</Text>
            <Text style={[styles.emptySubtext, { color: theme.tertiaryText }]}>Add a payment method to make purchases</Text>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Secure Payments</Text>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            Your payment information is encrypted and secure. We never store your full card
            details.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
  },
  methodsList: {
    gap: 12,
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: "700" as const,
  },
  methodNumber: {
    fontSize: 14,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  methodExpiry: {
    fontSize: 12,
  },
  optionsButton: {
    padding: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
