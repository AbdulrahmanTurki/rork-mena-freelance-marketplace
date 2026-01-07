import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Clock, Star, Check, MessageCircle, Tag } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGig } from "@/hooks/useGigs";

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

  const { data: gig, isLoading } = useGig(id as string);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (!gig) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text, fontSize: 16 }}>Gig not found</Text>
      </View>
    );
  }

  const packages = (gig.packages as any) || [];
  const selectedPackage = packages.find((p: any) => p.name === selectedTier);

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
          {(gig.images as string[])?.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.gigImage} />
          ))}
        </ScrollView>

        <View style={styles.content}>
          <View style={styles.sellerInfo}>
            <Image
              source={{ uri: gig.seller?.avatar_url || 'https://ui-avatars.com/api/?name=' + gig.seller?.full_name }}
              style={styles.sellerAvatar}
            />
            <View style={styles.sellerDetails}>
              <Text style={[styles.sellerName, { color: theme.text }]}>{gig.seller?.full_name || 'Seller'}</Text>
              <View style={styles.sellerStats}>
                <View style={styles.rating}>
                  <Star
                    size={14}
                    fill={BrandColors.secondary}
                    color={BrandColors.secondary}
                  />
                  <Text style={[styles.ratingText, { color: theme.text }]}>{gig.seller?.rating || 5.0}</Text>
                </View>
                <Text style={[styles.statSeparator, { color: theme.tertiaryText }]}>•</Text>
                <Text style={[styles.statText, { color: theme.secondaryText }]}>
                  {gig.seller?.review_count || 0} {t("reviews")}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.gigTitle, { color: theme.text }]}>{gig.title}</Text>

          {(gig.tags as string[])?.length > 0 && (
            <View style={styles.tagsContainer}>
              {(gig.tags as string[]).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: BrandColors.primary + '15' }]}>
                  <Tag size={12} color={BrandColors.primary} />
                  <Text style={[styles.tagText, { color: BrandColors.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.pricingSelector}>
            {packages.map((tier: any) => (
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

          {selectedPackage && (
            <View style={[styles.pricingCard, { backgroundColor: theme.card }]}>
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={[styles.pricingTitle, { color: theme.text }]}>
                    {t(selectedPackage.name)} Package
                  </Text>
                  <Text style={[styles.pricingDescription, { color: theme.secondaryText }]}>
                    {selectedPackage.description}
                  </Text>
                </View>
                <Text style={styles.pricingPrice}>SAR{selectedPackage.price}</Text>
              </View>

              <View style={[styles.deliveryTime, { borderBottomColor: theme.border }]}>
                <Clock size={16} color={theme.secondaryText} />
                <Text style={[styles.deliveryText, { color: theme.secondaryText }]}>
                  {selectedPackage.delivery_days} {t("days")} {t("deliveryTime")}
                </Text>
              </View>

              <View style={styles.featuresList}>
                {selectedPackage.features.map((feature: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Check size={16} color={BrandColors.primary} />
                    <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.orderButton} onPress={() => router.push("/checkout" as any)}>
                <Text style={styles.orderButtonText}>
                  Continue (SAR{selectedPackage.price})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => router.push(`/chat/${gig.seller?.id}` as any)}
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  bottomPadding: {
    height: 40,
  },
});
