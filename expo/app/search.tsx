import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getFreelancerById, searchGigs, type Gig } from "@/mocks/data";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { Search, X, Star } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Gig[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim().length > 0) {
      const searchResults = searchGigs(text);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  const handleGigPress = (gig: Gig) => {
    Keyboard.dismiss();
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground }]}>
          <Search size={20} color={BrandColors.gray400} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t("search")}
            placeholderTextColor={BrandColors.gray400}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <X size={20} color={BrandColors.gray400} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {query.length === 0 ? (
        <View style={styles.emptyState}>
          <Search size={48} color={BrandColors.gray300} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Search for services</Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
            Try searching for &quot;logo design&quot;, &quot;content writing&quot;, or &quot;translation&quot;
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
            Try different keywords or browse categories
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderGigItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: theme.secondaryText }]}>
              {results.length} {results.length === 1 ? "service" : "services"} found
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.neutralLight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BrandColors.white,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.gray200,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: BrandColors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: BrandColors.neutralDark,
    padding: 0,
  },
  cancelButton: {
    fontSize: 16,
    color: BrandColors.primary,
    fontWeight: "600" as const,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: BrandColors.gray600,
    textAlign: "center",
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 8,
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
});
