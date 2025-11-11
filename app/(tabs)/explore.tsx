import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { categories, type Category } from "@/mocks/data";
import { Stack, useRouter } from "expo-router";
import {
  Briefcase,
  Calculator,
  Camera,
  Code,
  Database,
  FileText,
  Film,
  Headphones,
  Languages,
  Mic,
  MoreHorizontal,
  Music,
  PaletteIcon,
  PenTool,
  Search,
  Share2,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Video,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

export default function ExploreScreen() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();

  const handleCategoryPress = (category: Category) => {
    router.push(`/category/${category.id}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: t("explore"),
          headerStyle: { backgroundColor: theme.headerBackground },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t("categories")}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Explore services across different categories
        </Text>

        <View style={styles.categoriesGrid}>
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon];
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: theme.card }]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: theme.inputBackground }]}>
                  {IconComponent && (
                    <IconComponent size={32} color={BrandColors.primary} />
                  )}
                </View>
                <Text style={[styles.categoryName, { color: theme.text }]}>
                  {language === "en" ? category.nameEn : category.nameAr}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BrandColors.gray600,
    marginBottom: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: BrandColors.neutralLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    textAlign: "center",
  },
});
