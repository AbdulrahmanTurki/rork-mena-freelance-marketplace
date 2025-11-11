import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import {
  Plus,
  X,
  FileImage,
  Clock,
  Package as PackageIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useCreateGig } from "@/hooks/useGigs";
import { useCategories } from "@/hooks/useCategories";

type PricingPackage = {
  name: "basic" | "standard" | "premium";
  price: string;
  deliveryDays: string;
  description: string;
  features: string[];
};

export default function CreateGigScreen() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const createGigMutation = useCreateGig();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const [packages, setPackages] = useState<PricingPackage[]>([
    {
      name: "basic",
      price: "",
      deliveryDays: "",
      description: "",
      features: [""],
    },
    {
      name: "standard",
      price: "",
      deliveryDays: "",
      description: "",
      features: [""],
    },
    {
      name: "premium",
      price: "",
      deliveryDays: "",
      description: "",
      features: [""],
    },
  ]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const updatePackage = (
    packageName: "basic" | "standard" | "premium",
    field: keyof PricingPackage,
    value: string
  ) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName ? { ...pkg, [field]: value } : pkg
      )
    );
  };

  const addFeature = (packageName: "basic" | "standard" | "premium") => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName
          ? { ...pkg, features: [...pkg.features, ""] }
          : pkg
      )
    );
  };

  const updateFeature = (
    packageName: "basic" | "standard" | "premium",
    index: number,
    value: string
  ) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName
          ? {
              ...pkg,
              features: pkg.features.map((f, i) => (i === index ? value : f)),
            }
          : pkg
      )
    );
  };

  const removeFeature = (
    packageName: "basic" | "standard" | "premium",
    index: number
  ) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName
          ? { ...pkg, features: pkg.features.filter((_, i) => i !== index) }
          : pkg
      )
    );
  };

  const handlePublish = async () => {
    console.log("[CreateGig] Starting validation...");
    
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a service");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your service");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const basicPackage = packages.find((p) => p.name === "basic");
    if (!basicPackage?.price || parseFloat(basicPackage.price) <= 0) {
      Alert.alert("Error", "Please set a price for the basic package");
      return;
    }
    if (!basicPackage?.deliveryDays || parseInt(basicPackage.deliveryDays) <= 0) {
      Alert.alert("Error", "Please set delivery days for the basic package");
      return;
    }

    try {
      console.log("[CreateGig] Creating gig...");
      
      const packagesData = packages.map(pkg => ({
        name: pkg.name,
        price: pkg.price ? parseFloat(pkg.price) : 0,
        deliveryDays: pkg.deliveryDays ? parseInt(pkg.deliveryDays) : 0,
        description: pkg.description,
        features: pkg.features.filter(f => f.trim() !== ""),
      })).filter(pkg => pkg.price > 0 && pkg.deliveryDays > 0);
      
      const gigData = {
        seller_id: user.id,
        category_id: selectedCategory,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(basicPackage.price),
        delivery_time: parseInt(basicPackage.deliveryDays),
        tags: tags.length > 0 ? tags : null,
        revisions_included: 1,
        is_active: true,
        packages: packagesData.length > 0 ? packagesData : null,
      };
      
      console.log("[CreateGig] Gig data:", gigData);
      await createGigMutation.mutateAsync(gigData);
      
      console.log("[CreateGig] Gig created successfully");
      Alert.alert(
        "Success",
        "Your service has been published successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error("[CreateGig] Error creating gig:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to create service. Please try again."
      );
    }
  };

  const getPackageTitle = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getPackageColor = (name: string) => {
    switch (name) {
      case "basic":
        return "#4CAF50";
      case "standard":
        return BrandColors.primary;
      case "premium":
        return BrandColors.accent;
      default:
        return BrandColors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Create Service",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Service Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="E.g., I will design a modern logo"
              placeholderTextColor={theme.tertiaryText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
            {isCategoriesLoading ? (
              <ActivityIndicator size="small" color={BrandColors.primary} />
            ) : categoriesData && categoriesData.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
              >
                {categoriesData.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === cat.id &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                  No categories available. Please contact admin to add categories.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="Describe your service in detail..."
              placeholderTextColor={theme.tertiaryText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Search Tags (Max 5)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.tagInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Add a tag"
                placeholderTextColor={theme.tertiaryText}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={handleAddTag}
                disabled={tags.length >= 5}
              >
                <Plus
                  size={18}
                  color={tags.length >= 5 ? BrandColors.gray400 : BrandColors.white}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(index)}>
                    <X size={14} color={BrandColors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Service Images</Text>
            <TouchableOpacity style={[styles.uploadBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <FileImage size={32} color={BrandColors.gray400} />
              <Text style={[styles.uploadText, { color: theme.text }]}>Upload Images</Text>
              <Text style={styles.uploadHint}>Up to 5 images</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pricing Packages</Text>
          
          {packages.map((pkg) => (
            <View
              key={pkg.name}
              style={[
                styles.packageCard,
                { backgroundColor: theme.card, borderLeftColor: getPackageColor(pkg.name) },
              ]}
            >
              <View
                style={[
                  styles.packageHeader,
                  { backgroundColor: getPackageColor(pkg.name) + "15" },
                ]}
              >
                <PackageIcon
                  size={20}
                  color={getPackageColor(pkg.name)}
                />
                <Text
                  style={[
                    styles.packageTitle,
                    { color: getPackageColor(pkg.name) },
                  ]}
                >
                  {getPackageTitle(pkg.name)} Package
                </Text>
              </View>

              <View style={styles.packageContent}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.smallLabel}>Price (SAR) *</Text>
                    <View style={styles.iconInput}>
                      <TextInput
                        style={styles.iconInputField}
                        placeholder="0"
                        placeholderTextColor={theme.tertiaryText}
                        value={pkg.price}
                        onChangeText={(value) =>
                          updatePackage(pkg.name, "price", value)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.halfInput}>
                    <Text style={styles.smallLabel}>Delivery Days *</Text>
                    <View style={styles.iconInput}>
                      <Clock size={16} color={BrandColors.gray500} />
                      <TextInput
                        style={styles.iconInputField}
                        placeholder="0"
                        placeholderTextColor={theme.tertiaryText}
                        value={pkg.deliveryDays}
                        onChangeText={(value) =>
                          updatePackage(pkg.name, "deliveryDays", value)
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.smallLabel}>Package Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textAreaSmall, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Brief description of this package"
                    placeholderTextColor={theme.tertiaryText}
                    value={pkg.description}
                    onChangeText={(value) =>
                      updatePackage(pkg.name, "description", value)
                    }
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.smallLabel}>Features</Text>
                  {pkg.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <TextInput
                        style={[styles.featureInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                        placeholder={`Feature ${index + 1}`}
                        placeholderTextColor={theme.tertiaryText}
                        value={feature}
                        onChangeText={(value) =>
                          updateFeature(pkg.name, index, value)
                        }
                      />
                      {pkg.features.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeFeature(pkg.name, index)}
                          style={styles.removeFeatureButton}
                        >
                          <X size={16} color={BrandColors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addFeatureButton}
                    onPress={() => addFeature(pkg.name)}
                  >
                    <Plus size={16} color={BrandColors.primary} />
                    <Text style={styles.addFeatureText}>Add Feature</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.publishButton, createGigMutation.isPending && styles.publishButtonDisabled]} 
          onPress={handlePublish}
          disabled={createGigMutation.isPending}
        >
          {createGigMutation.isPending ? (
            <ActivityIndicator size="small" color={BrandColors.white} />
          ) : (
            <Text style={styles.publishButtonText}>Publish Service</Text>
          )}
        </TouchableOpacity>

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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: BrandColors.neutralDark,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
    marginBottom: 10,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: BrandColors.neutralDark,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  textAreaSmall: {
    minHeight: 80,
    paddingTop: 14,
  },
  categoriesScroll: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
  },
  categoryChipActive: {
    backgroundColor: BrandColors.primary + "15",
    borderColor: BrandColors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.gray600,
  },
  categoryChipTextActive: {
    color: BrandColors.primary,
  },
  tagInputContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: BrandColors.neutralDark,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: BrandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: BrandColors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  uploadBox: {
    backgroundColor: BrandColors.white,
    borderWidth: 2,
    borderColor: BrandColors.gray200,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: BrandColors.neutralDark,
  },
  uploadHint: {
    fontSize: 13,
    color: BrandColors.gray500,
  },
  packageCard: {
    backgroundColor: BrandColors.white,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  packageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  packageContent: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  iconInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconInputField: {
    flex: 1,
    fontSize: 15,
    color: BrandColors.neutralDark,
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  featureInput: {
    flex: 1,
    backgroundColor: BrandColors.gray100,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: BrandColors.neutralDark,
  },
  removeFeatureButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.error + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  addFeatureButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  addFeatureText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: BrandColors.primary,
  },
  publishButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  publishButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: BrandColors.white,
  },
  bottomPadding: {
    height: 40,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  emptyBox: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: BrandColors.gray500,
    textAlign: "center",
  },
});
