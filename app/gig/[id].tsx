import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getFreelancerById, getGigById } from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Clock, Star, Check, MessageCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function GigDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">(
    "basic"
  );

  const gig = getGigById(id as string);
  const freelancer = gig ? getFreelancerById(gig.freelancerId) : undefined;

  if (!gig || !freelancer) {
    return (
      <View style={styles.container}>
        <Text>Gig not found</Text>
      </View>
    );
  }

  const selectedPricing = gig.pricing.find((p) => p.name === selectedTier);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.customHeader, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.card }]} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageCarousel}
        >
          {gig.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.gigImage} />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.sellerInfo}>
            <Image
              source={{ uri: freelancer.avatar }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={[styles.sellerName, { color: theme.text }]}>{freelancer.name}</Text>
              <View style={styles.sellerStats}>
                <View style={styles.rating}>
                  <Star
                    size={14}
                    fill={BrandColors.secondary}
                    color={BrandColors.secondary}
                  />
                  <Text style={[styles.ratingText, { color: theme.text }]}>{freelancer.rating}</Text>
                </View>
                <Text style={[styles.statSeparator, { color: theme.tertiaryText }]}>•</Text>
                <Text style={[styles.statText, { color: theme.secondaryText }]}>
                  {freelancer.reviewCount} {t("reviews")}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.gigTitle, { color: theme.text }]}>{gig.title}</Text>

          <View style={styles.pricingSelector}>
            {gig.pricing.map((tier) => (
              <TouchableOpacity
                key={tier.name}
                style={[
                  styles.tierButton,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  selectedTier === tier.name && styles.tierButtonActive,
                ]}
                onPress={() => setSelectedTier(tier.name)}
              >
                <Text
                  style={[
                    styles.tierButtonText,
                    { color: theme.text },
                    selectedTier === tier.name && styles.tierButtonTextActive,
                  ]}
                >
                  {t(tier.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedPricing && (
            <View style={[styles.pricingCard, { backgroundColor: theme.card }]}>
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={[styles.pricingTitle, { color: theme.text }]}>
                    {t(selectedPricing.name)} Package
                  </Text>
                  <Text style={[styles.pricingDescription, { color: theme.secondaryText }]}>
                    {selectedPricing.description}
                  </Text>
                </View>
                <Text style={styles.pricingPrice}>${selectedPricing.price}</Text>
              </View>

              <View style={[styles.deliveryTime, { borderBottomColor: theme.border }]}>
                <Clock size={16} color={theme.secondaryText} />
                <Text style={[styles.deliveryText, { color: theme.secondaryText }]}>
                  {selectedPricing.deliveryDays} {t("days")} {t("deliveryTime")}
                </Text>
              </View>

              <View style={styles.featuresList}>
                {selectedPricing.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={16} color={BrandColors.primary} />
                    <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.orderButton} onPress={() => router.push("/checkout" as any)}>
                <Text style={styles.orderButtonText}>
                  Continue (SAR{selectedPricing.price})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => router.push(`/chat/${freelancer.id}` as any)}
              >
                <MessageCircle size={20} color={BrandColors.primary} />
                <Text style={styles.chatButtonText}>Chat with Seller</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("aboutThisGig")}</Text>
            <Text style={[styles.description, { color: theme.secondaryText }]}>{gig.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("aboutSeller")}</Text>
            <View style={[styles.aboutSeller, { backgroundColor: theme.card }]}>
              <Text style={[styles.aboutSellerBio, { color: theme.secondaryText }]}>{freelancer.bio}</Text>
              <View style={styles.sellerMeta}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: theme.secondaryText }]}>{t("languages")}:</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>
                    {freelancer.languages.join(", ")}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: theme.secondaryText }]}>{t("skills")}:</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>
                    {freelancer.skills.join(", ")}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: theme.secondaryText }]}>{t("memberSince")}:</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>
                    {new Date(freelancer.memberSince).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  customHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  imageCarousel: {
    height: 300,
  },
  gigImage: {
    width: width,
    height: 300,
    backgroundColor: BrandColors.gray200,
  },
  content: {
    padding: 20,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  sellerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  statSeparator: {
    fontSize: 13,
    color: BrandColors.gray400,
  },
  statText: {
    fontSize: 13,
    color: BrandColors.gray600,
  },
  gigTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    lineHeight: 32,
    marginBottom: 24,
  },
  pricingSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tierButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
    alignItems: "center",
  },
  tierButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  tierButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  tierButtonTextActive: {
    color: BrandColors.white,
  },
  pricingCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pricingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  pricingPrice: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  deliveryTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
    marginBottom: 16,
  },
  deliveryText: {
    fontSize: 14,
    color: BrandColors.gray600,
  },
  featuresList: {
    gap: 12,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: BrandColors.neutralDark,
    flex: 1,
  },
  orderButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  chatButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: BrandColors.gray700,
  },
  aboutSeller: {
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    padding: 16,
  },
  aboutSellerBio: {
    fontSize: 14,
    lineHeight: 22,
    color: BrandColors.gray700,
    marginBottom: 16,
  },
  sellerMeta: {
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  metaValue: {
    fontSize: 14,
    color: BrandColors.neutralDark,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
