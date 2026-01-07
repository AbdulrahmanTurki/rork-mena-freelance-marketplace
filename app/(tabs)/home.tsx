import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  freelancers,
  type Freelancer,
} from "@/mocks/data";
import { useCategories } from "@/hooks/useCategories";
import { useGigs } from "@/hooks/useGigs";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import {
  Globe,
  PaletteIcon,
  PenTool,
  Languages,
  Share2,
  TrendingUp,
  Video,
  Code,
  Mic,
  Star,
  ChevronRight,
  Search,
  Camera,
  Music,
  Film,
  Database,
  Headphones,
  Smartphone,
  Briefcase,
  FileText,
  Calculator,
  ShoppingCart,
  MoreHorizontal,
} from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const iconMap: Record<string, React.ComponentType<any>> = {
  palette: PaletteIcon,
  "pen-tool": PenTool,
  languages: Languages,
  "share-2": Share2,
  "trending-up": TrendingUp,
  video: Video,
  code: Code,
  mic: Mic,
  camera: Camera,
  music: Music,
  film: Film,
  database: Database,
  headphones: Headphones,
  smartphone: Smartphone,
  search: Search,
  briefcase: Briefcase,
  "file-text": FileText,
  calculator: Calculator,
  "shopping-cart": ShoppingCart,
  "more-horizontal": MoreHorizontal,
};

export default function HomeScreen() {
  const { language, changeLanguage, t, isChanging } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { data: categories = [] } = useCategories();
  const { data: gigs = [] } = useGigs({ limit: 10 });

  const handleLanguageToggle = () => {
    changeLanguage(language === "en" ? "ar" : "en");
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}` as any);
  };

  const handleGigPress = (gigId: string) => {
    router.push(`/gig/${gigId}` as any);
  };

  const handleFreelancerPress = (freelancer: Freelancer) => {
    router.push(`/freelancer/${freelancer.id}` as any);
  };

  const handleSearchPress = () => {
    router.push("/search" as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {isChanging && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingCard, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Switching language...</Text>
          </View>
        </View>
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.appName, { color: theme.text }]}>{t("appName")}</Text>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: theme.inputBackground }]}
              onPress={handleLanguageToggle}
            >
              <Globe size={20} color={BrandColors.primary} />
              <Text style={styles.languageText}>
                {language === "en" ? "AR" : "EN"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.border, borderWidth: 1 }]} onPress={handleSearchPress}>
            <Search size={20} color={theme.tertiaryText} />
            <Text style={[styles.searchPlaceholder, { color: theme.tertiaryText }]}>{t("search")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitleStandalone, { color: theme.text }]}>{t("categories")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => {
              const iconName = category.icon || 'more-horizontal';
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: theme.inputBackground }]}>
                    {iconMap[iconName] && React.createElement(iconMap[iconName], { size: 24, color: BrandColors.primary })}
                  </View>
                  <Text style={[styles.categoryName, { color: theme.text }]}>
                    {language === "en" ? category.name : (category.name_ar || category.name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>{t("popularGigs")}</Text>
            <TouchableOpacity onPress={() => router.push("/view-all/gigs" as any)}>
              <Text style={styles.viewAllText}>{t("viewAll")}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gigsContainer}
          >
            {gigs.map((gig) => {
              const packages = (gig.packages as any) || [];
              const minPrice = packages.length > 0 ? Math.min(...packages.map((p: any) => p.price)) : gig.price;
              const thumbnail = (gig.images as string[])?.[0] || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop';

              return (
                <TouchableOpacity
                  key={gig.id}
                  style={[styles.gigCard, { backgroundColor: theme.card }]}
                  onPress={() => handleGigPress(gig.id)}
                >
                  <Image source={{ uri: thumbnail }} style={styles.gigImage} />
                  <View style={styles.gigFooter}>
                    <View style={styles.gigHeader}>
                      <Image
                        source={{ uri: gig.seller?.avatar_url || 'https://ui-avatars.com/api/?name=' + gig.seller?.full_name }}
                        style={styles.avatar}
                      />
                      <View style={styles.gigInfo}>
                        <Text style={[styles.freelancerName, { color: theme.secondaryText }]} numberOfLines={1}>
                          {gig.seller?.full_name || 'Seller'}
                        </Text>
                        <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                          {gig.title}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.gigBottom}>
                      <View style={styles.rating}>
                        <Star
                          size={14}
                          fill={BrandColors.secondary}
                          color={BrandColors.secondary}
                        />
                        <Text style={[styles.ratingText, { color: theme.text }]}>
                          {gig.rating || 5.0}
                        </Text>
                        <Text style={styles.reviewCount}>
                          ({gig.reviews_count || 0})
                        </Text>
                      </View>
                      <Text style={[styles.price, { color: theme.text }]}>
                        {t("startingAt")} SAR{minPrice}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderTitle, { color: theme.text }]}>{t("topRated")}</Text>
            <TouchableOpacity
              onPress={() => router.push("/view-all/freelancers" as any)}
            >
              <Text style={styles.viewAllText}>{t("viewAll")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.freelancersContainer}>
            {freelancers.slice(0, 4).map((freelancer) => (
              <TouchableOpacity
                key={freelancer.id}
                style={[styles.freelancerCard, { backgroundColor: theme.card }]}
                onPress={() => handleFreelancerPress(freelancer)}
              >
                <Image
                  source={{ uri: freelancer.avatar }}
                  style={styles.freelancerAvatar}
                />
                <View style={styles.freelancerInfo}>
                  <Text style={[styles.freelancerCardName, { color: theme.text }]}>{freelancer.name}</Text>
                  <Text style={styles.freelancerSkills} numberOfLines={1}>
                    {freelancer.skills.join(" • ")}
                  </Text>
                  <View style={styles.freelancerStats}>
                    <View style={styles.rating}>
                      <Star
                        size={14}
                        fill={BrandColors.secondary}
                        color={BrandColors.secondary}
                      />
                      <Text style={[styles.ratingText, { color: theme.text }]}>{freelancer.rating}</Text>
                    </View>
                    <Text style={styles.statText}>
                      {freelancer.reviewCount} {t("reviews")}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={BrandColors.gray400} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: BrandColors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: BrandColors.gray100,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: BrandColors.gray400,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleStandalone: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    width: 90,
    gap: 12,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    textAlign: "center",
  },
  gigsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  gigCard: {
    width: 280,
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
    height: 180,
    backgroundColor: BrandColors.gray200,
  },
  gigFooter: {
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
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    lineHeight: 18,
  },
  gigBottom: {
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
    fontSize: 14,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  freelancersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  freelancerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BrandColors.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  freelancerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  freelancerInfo: {
    flex: 1,
    gap: 4,
  },
  freelancerCardName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  freelancerSkills: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  freelancerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  bottomPadding: {
    height: 40,
  },
  loadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1000,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingCard: {
    backgroundColor: BrandColors.white,
    padding: 32,
    borderRadius: 20,
    alignItems: "center" as const,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
});
