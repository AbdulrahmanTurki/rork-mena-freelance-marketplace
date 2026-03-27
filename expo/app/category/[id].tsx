import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  categories,
  getFreelancerById,
  getGigsByCategory,
  type Gig,
} from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();

  const category = categories.find((c) => c.id === id);
  const gigs = getGigsByCategory(id as string);

  if (!category) {
    return (
      <View style={styles.container}>
        <Text>Category not found</Text>
      </View>
    );
  }

  const handleGigPress = (gig: Gig) => {
    router.push(`/gig/${gig.id}` as any);
  };

  const renderGigItem = ({ item: gig }: { item: Gig }) => {
    const freelancer = getFreelancerById(gig.freelancerId);
    const minPrice = Math.min(...gig.pricing.map((p) => p.price));

    return (
      <TouchableOpacity
        style={[styles.gigCard, { backgroundColor: theme.card }]}
        onPress={() => handleGigPress(gig)}
      >
        <Image source={{ uri: gig.thumbnail }} style={styles.gigImage} />
        {freelancer && (
          <View style={styles.gigContent}>
            <View style={styles.gigHeader}>
              <Image
                source={{ uri: freelancer.avatar }}
                style={styles.avatar}
              />
              <View style={styles.gigInfo}>
                <Text style={[styles.freelancerName, { color: theme.secondaryText }]} numberOfLines={1}>
                  {freelancer.name}
                </Text>
                <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                  {gig.title}
                </Text>
              </View>
            </View>
            <View style={styles.gigFooter}>
              <View style={styles.rating}>
                <Star
                  size={14}
                  fill={BrandColors.secondary}
                  color={BrandColors.secondary}
                />
                <Text style={[styles.ratingText, { color: theme.text }]}>{freelancer.rating}</Text>
                <Text style={styles.reviewCount}>
                  ({freelancer.reviewCount})
                </Text>
              </View>
              <Text style={[styles.price, { color: theme.text }]}>
                {t("startingAt")} ${minPrice}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: language === "en" ? category.nameEn : category.nameAr,
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />
      <FlatList
        data={gigs}
        renderItem={renderGigItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No services found in this category yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  gigCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  gigImage: {
    width: "100%",
    height: 200,
    backgroundColor: BrandColors.gray200,
  },
  gigContent: {
    padding: 12,
  },
  gigHeader: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  gigInfo: {
    flex: 1,
  },
  freelancerName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 2,
  },
  gigTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    lineHeight: 20,
  },
  gigFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  reviewCount: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  price: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: BrandColors.gray600,
    textAlign: "center",
  },
});
