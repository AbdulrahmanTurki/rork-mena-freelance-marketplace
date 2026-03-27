import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { Stack } from "expo-router";
import { Search, MessageCircle, Mail, Phone, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

const FAQ_ITEMS = [
  {
    id: "1",
    category: "Account",
    question: "How do I reset my password?",
    answer: "Go to Settings > Change Password to update your password.",
  },
  {
    id: "2",
    category: "Orders",
    question: "How can I track my order?",
    answer: "Visit the Orders tab to see all your active orders and their status.",
  },
  {
    id: "3",
    category: "Payment",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and bank transfers.",
  },
  {
    id: "4",
    category: "Sellers",
    question: "How do I become a seller?",
    answer: "Switch to seller mode from your profile to start creating gigs.",
  },
  {
    id: "5",
    category: "Security",
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption to protect your data.",
  },
];

export default function HelpCenterScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSupport = (method: string) => {
    Alert.alert("Contact Support", `You selected ${method}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Help Center",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Search size={20} color={theme.tertiaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for help..."
            placeholderTextColor={theme.tertiaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            Contact Support
          </Text>

          <View style={styles.contactGrid}>
            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: theme.card }]}
              onPress={() => handleContactSupport("Live Chat")}
            >
              <View style={[styles.contactIcon, { backgroundColor: BrandColors.primary + "15" }]}>
                <MessageCircle size={24} color={BrandColors.primary} />
              </View>
              <Text style={[styles.contactTitle, { color: theme.text }]}>Live Chat</Text>
              <Text style={[styles.contactSubtitle, { color: theme.tertiaryText }]}>
                Chat with us now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: theme.card }]}
              onPress={() => handleContactSupport("Email")}
            >
              <View style={[styles.contactIcon, { backgroundColor: BrandColors.secondary + "15" }]}>
                <Mail size={24} color={BrandColors.secondary} />
              </View>
              <Text style={[styles.contactTitle, { color: theme.text }]}>Email</Text>
              <Text style={[styles.contactSubtitle, { color: theme.tertiaryText }]}>
                support@app.com
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactCard, { backgroundColor: theme.card }]}
              onPress={() => handleContactSupport("Phone")}
            >
              <View style={[styles.contactIcon, { backgroundColor: BrandColors.accent + "15" }]}>
                <Phone size={24} color={BrandColors.accent} />
              </View>
              <Text style={[styles.contactTitle, { color: theme.text }]}>Phone</Text>
              <Text style={[styles.contactSubtitle, { color: theme.tertiaryText }]}>
                +966 800 123 456
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>
            Frequently Asked Questions
          </Text>

          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.faqItem, { backgroundColor: theme.card }]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqCategory, { color: BrandColors.primary }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={[styles.faqQuestion, { color: theme.text }]}>
                    {item.question}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.tertiaryText} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                No results found for "{searchQuery}"
              </Text>
            </View>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  contactSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactCard: {
    flex: 1,
    minWidth: "30%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    marginBottom: 6,
  },
  faqCategory: {
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 22,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  bottomPadding: {
    height: 40,
  },
});
