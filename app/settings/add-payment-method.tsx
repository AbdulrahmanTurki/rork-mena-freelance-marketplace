import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { CreditCard, Calendar, Lock, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

type CardType = "visa" | "mastercard" | "mada" | null;

export default function AddPaymentMethodScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [cardType, setCardType] = useState<CardType>(null);

  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "visa";
    if (cleaned.startsWith("5")) return "mastercard";
    if (cleaned.startsWith("9")) return "mada";
    return null;
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    const formatted = chunks ? chunks.join(" ") : cleaned;
    setCardNumber(formatted);
    setCardType(detectCardType(formatted));
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\//g, "");
    if (cleaned.length >= 2) {
      setExpiryDate(`${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleSave = () => {
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      Alert.alert("Error", "Please enter a valid card number");
      return;
    }

    if (expiryDate.length < 5) {
      Alert.alert("Error", "Please enter a valid expiry date");
      return;
    }

    if (cvv.length < 3) {
      Alert.alert("Error", "Please enter a valid CVV");
      return;
    }

    Alert.alert(
      "Success",
      "Payment method added successfully!",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Add Payment Method",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.cardPreview}>
            <View style={styles.cardTopRow}>
              <CreditCard size={32} color={BrandColors.primary} />
              {cardType && (
                <View style={styles.cardTypeBadge}>
                  <Text style={styles.cardTypeText}>
                    {cardType.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardNumberPreview, { color: theme.text }]}>
              {cardNumber || "•••• •••• •••• ••••"}
            </Text>
            <View style={styles.cardBottomRow}>
              <Text style={[styles.cardholderPreview, { color: theme.secondaryText }]}>
                {cardholderName || "CARDHOLDER NAME"}
              </Text>
              <Text style={[styles.expiryPreview, { color: theme.secondaryText }]}>
                {expiryDate || "MM/YY"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <CreditCard size={16} color={theme.secondaryText} />
              <Text style={[styles.label, { color: theme.text }]}>Card Number *</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
              ]}
              value={cardNumber}
              onChangeText={formatCardNumber}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.tertiaryText}
              keyboardType="number-pad"
              maxLength={19}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={16} color={theme.secondaryText} />
              <Text style={[styles.label, { color: theme.text }]}>Cardholder Name *</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
              ]}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="AHMED AL-MALIK"
              placeholderTextColor={theme.tertiaryText}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.labelRow}>
                <Calendar size={16} color={theme.secondaryText} />
                <Text style={[styles.label, { color: theme.text }]}>Expiry Date *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                value={expiryDate}
                onChangeText={formatExpiryDate}
                placeholder="MM/YY"
                placeholderTextColor={theme.tertiaryText}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.labelRow}>
                <Lock size={16} color={theme.secondaryText} />
                <Text style={[styles.label, { color: theme.text }]}>CVV *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                ]}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                placeholderTextColor={theme.tertiaryText}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.border },
                isDefault && { backgroundColor: BrandColors.primary, borderColor: BrandColors.primary },
              ]}
            >
              {isDefault && <View style={styles.checkmark} />}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.text }]}>
              Set as default payment method
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.securityNote, { backgroundColor: theme.card }]}>
          <Lock size={20} color={BrandColors.success} />
          <View style={styles.securityTextContainer}>
            <Text style={[styles.securityTitle, { color: theme.text }]}>
              Secure Payment
            </Text>
            <Text style={[styles.securityText, { color: theme.secondaryText }]}>
              Your card information is encrypted and stored securely. We never share your details.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Add Payment Method</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardPreview: {
    gap: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTypeBadge: {
    backgroundColor: BrandColors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  cardNumberPreview: {
    fontSize: 22,
    fontWeight: "600" as const,
    letterSpacing: 2,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardholderPreview: {
    fontSize: 14,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  expiryPreview: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500" as const,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: BrandColors.white,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  securityNote: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  securityTextContainer: {
    flex: 1,
    gap: 4,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  bottomPadding: {
    height: 40,
  },
});
