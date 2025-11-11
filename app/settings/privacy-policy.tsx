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

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Privacy Policy",
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We collect information you provide directly to us, including your name, email
            address, phone number, and payment information. We also collect information about
            your use of our services, including device information and usage patterns.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>2. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We use your information to provide and improve our services, process transactions,
            send you updates and notifications, and ensure the security of our platform. We may
            also use your information for analytics and marketing purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Information Sharing</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We do not sell your personal information. We may share your information with service
            providers who help us operate our platform, with your consent, or as required by law.
            All service providers are bound by confidentiality agreements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Data Security</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We implement industry-standard security measures to protect your personal
            information. This includes encryption, secure servers, and regular security audits.
            However, no method of transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Cookies and Tracking</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We use cookies and similar tracking technologies to enhance your experience,
            understand usage patterns, and deliver personalized content. You can control cookie
            settings through your browser preferences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Your Rights</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            You have the right to access, update, or delete your personal information at any
            time. You can also object to certain processing activities or request data
            portability. Contact us to exercise these rights.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>7. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            Our services are not intended for children under 18 years of age. We do not
            knowingly collect personal information from children. If we learn we have collected
            information from a child, we will delete it immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>8. Changes to Privacy Policy</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            We may update this privacy policy from time to time. We will notify you of any
            material changes by posting the new policy on this page and updating the "Last
            updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>9. Contact Us</Text>
          <Text style={[styles.paragraph, { color: theme.secondaryText }]}>
            If you have questions or concerns about this privacy policy or our data practices,
            please contact us at privacy@app.com or +966 800 123 456.
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
