import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function TermsScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Terms & Conditions",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.updateDate, { color: theme.tertiaryText }]}>
          Last updated: January 1, 2024
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            By accessing and using this platform, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to these terms, please do not
            use our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>2. User Accounts</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Services</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            Our platform provides a marketplace for freelancers and clients to connect and
            collaborate. We reserve the right to modify or discontinue services at any time
            without notice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Payment Terms</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            All transactions are processed securely. Fees and charges are clearly disclosed
            before completing any transaction. Refunds are subject to our refund policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>5. User Conduct</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            Users must not engage in any activity that is illegal, fraudulent, or harmful to
            others. We reserve the right to suspend or terminate accounts that violate these
            terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            All content on this platform is protected by copyright and other intellectual
            property laws. Users retain ownership of their original content but grant us a
            license to use it on our platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We are not liable for any indirect, incidental, or consequential damages arising
            from your use of our services. Our total liability is limited to the amount paid by
            you in the past 12 months.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We reserve the right to modify these terms at any time. Users will be notified of
            significant changes. Continued use of the platform after changes constitutes
            acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Contact Information</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            If you have any questions about these Terms & Conditions, please contact us at
            support@app.com or +966 800 123 456.
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
  updateDate: {
    fontSize: 13,
    marginBottom: 24,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
