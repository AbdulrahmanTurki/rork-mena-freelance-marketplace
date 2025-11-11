import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getFreelancerById, gigs } from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BadgeCheck, Star } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FreelancerProfileScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const freelancer = getFreelancerById(id as string);
  const freelancerGigs = gigs.filter((g) => g.freelancerId === id);

  if (!freelancer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Freelancer not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: freelancer.name, headerStyle: { backgroundColor: theme.headerBackground }, headerTintColor: theme.text }} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingTop: Math.max(32, insets.top + 16) }]}>
          <Image
            source={{ uri: freelancer.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.nameContainer}>
            <Text style={[styles.name, { color: theme.text }]}>{freelancer.name}</Text>
            {freelancer.verified && (
              <BadgeCheck size={20} color={BrandColors.primary} />
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.rating}>
                <Star
                  size={16}
                  fill={BrandColors.secondary}
                  color={BrandColors.secondary}
                />
                <Text style={[styles.statValue, { color: theme.text }]}>{freelancer.rating}</Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("rating")}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{freelancer.reviewCount}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("reviews")}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>{freelancer.ordersInQueue}</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{t("ordersInQueue")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("aboutSeller")}</Text>
            <Text style={[styles.bio, { color: theme.secondaryText }]}>{freelancer.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("languages")}</Text>
            <View style={styles.tagContainer}>
              {freelancer.languages.map((lang, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                  <Text style={[styles.tagText, { color: theme.secondaryText }]}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("skills")}</Text>
            <View style={styles.tagContainer}>
              {freelancer.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Services ({freelancerGigs.length})
            </Text>
            <View style={styles.gigsContainer}>
              {freelancerGigs.map((gig) => {
                const minPrice = Math.min(...gig.pricing.map((p) => p.price));
                return (
                  <TouchableOpacity
                    key={gig.id}
                    style={[styles.gigCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push(`/gig/${gig.id}` as any)}
                  >
                    <Image
                      source={{ uri: gig.thumbnail }}
                      style={styles.gigImage}
                    />
                    <View style={styles.gigInfo}>
                      <Text style={[styles.gigTitle, { color: theme.text }]} numberOfLines={2}>
                        {gig.title}
                      </Text>
                      <Text style={[styles.gigPrice, { color: BrandColors.primary }]}>
                        From ${minPrice}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: BrandColors.white,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: BrandColors.gray600,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: BrandColors.gray200,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    color: BrandColors.gray700,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: BrandColors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
  },
  tagText: {
    fontSize: 14,
    color: BrandColors.gray700,
  },
  skillTag: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  skillTagText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.white,
  },
  gigsContainer: {
    gap: 16,
  },
  gigCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gigImage: {
    width: "100%",
    height: 180,
    backgroundColor: BrandColors.gray200,
  },
  gigInfo: {
    padding: 12,
  },
  gigTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  gigPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: BrandColors.primary,
  },
  bottomPadding: {
    height: 20,
  },
});
