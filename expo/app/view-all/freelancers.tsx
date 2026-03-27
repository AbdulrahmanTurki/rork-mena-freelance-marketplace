import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { freelancers, type Freelancer } from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Star, ChevronRight } from "lucide-react-native";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ViewAllFreelancersScreen() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();

  const handleFreelancerPress = (freelancer: Freelancer) => {
    router.push(`/freelancer/${freelancer.id}` as any);
  };

  const renderFreelancerItem = ({ item: freelancer }: { item: Freelancer }) => (
    <TouchableOpacity
      style={styles.freelancerCard}
      onPress={() => handleFreelancerPress(freelancer)}
    >
      <Image
        source={{ uri: freelancer.avatar }}
        style={styles.freelancerAvatar}
      />
      <View style={styles.freelancerInfo}>
        <Text style={styles.freelancerCardName}>{freelancer.name}</Text>
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
            <Text style={styles.ratingText}>{freelancer.rating}</Text>
          </View>
          <Text style={styles.statText}>
            {freelancer.reviewCount} {t("reviews")}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={BrandColors.gray400} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: language === "en" ? "Top Rated Freelancers" : "أفضل المستقلين",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <FlatList
        data={freelancers}
        renderItem={renderFreelancerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  statText: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
});
