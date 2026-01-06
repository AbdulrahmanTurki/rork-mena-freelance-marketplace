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
  Image, // <--- Added Image Component
} from "react-native";
import { useCreateGig } from "@/hooks/useGigs";
import { useCategories } from "@/hooks/useCategories";
import * as ImagePicker from "expo-image-picker"; // <--- Added Image Picker
import { supabase } from "@/lib/supabase"; // <--- Added Supabase

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
  
  // --- NEW: Image State ---
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  // --- NEW: Image Picker Function ---
  const pickImage = async () => {
    try {
      console.log("Launching Image Picker...");
      // Direct launch - handles permission prompt automatically
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newUris = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newUris].slice(0, 5));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Could not open gallery. Please check permissions in Settings.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

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
    if (!user) {
      Alert.alert("Error", "You must be logged in to create a service");
      return;
    }

    if (!title.trim() || !description.trim() || !selectedCategory) {
      Alert.alert("Error", "Please fill in all required fields (Title, Description, Category)");
      return;
    }

    const basicPackage = packages.find((p) => p.name === "basic");
    if (!basicPackage?.price || parseFloat(basicPackage.price) <= 0) {
      Alert.alert("Error", "Please set a price for the basic package");
      return;
    }

    try {
      setIsUploading(true);
      
      // 1. Upload Images to Supabase
      const uploadedImageUrls: string[] = [];
      for (const uri of images) {
        const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const formData = new FormData();
        
        // @ts-ignore
        formData.append('file', {
          uri,
          name: filename,
          type: 'image/jpeg',
        });

        const { error } = await supabase.storage
          .from('gig-images')
          .upload(filename, formData, { contentType: 'image/jpeg' });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('gig-images')
          .getPublicUrl(filename);
          
        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      // 2. Prepare Data
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
        delivery_time: parseInt(basicPackage.deliveryDays || '0'),
        tags: tags.length > 0 ? tags : null,
        revisions_included: 1,
        is_active: true,
        packages: packagesData.length > 0 ? packagesData : null,
        images: uploadedImageUrls, // Save the Supabase URLs
      };
      
      await createGigMutation.mutateAsync(gigData);
      
      Alert.alert("Success", "Your service has been published successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Error creating gig:", error);
      Alert.alert("Error", error?.message || "Failed to create service.");
    } finally {
      setIsUploading(false);
    }
  };

  const getPackageTitle = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

  const getPackageColor = (name: string) => {
    switch (name) {
      case "basic": return "#4CAF50";
      case "standard": return BrandColors.primary;
      case "premium": return BrandColors.accent;
      default: return BrandColors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Create Service",
          headerStyle: { backgroundColor: theme.headerBackground },
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                {categoriesData.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: theme.secondaryText }}>No categories available.</Text>
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
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Search Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.tagInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Add a tag"
                placeholderTextColor={theme.tertiaryText}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                <Plus size={18} color={BrandColors.white} />
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

          {/* --- Image Upload Section --- */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Service Images</Text>
            
            {/* Upload Button */}
            <TouchableOpacity 
              onPress={pickImage}
              style={[styles.uploadBox, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <FileImage size={32} color={BrandColors.gray400} />
              <Text style={[styles.uploadText, { color: theme.text }]}>
                {images.length > 0 ? "Add More Images" : "Upload Images"}
              </Text>
              <Text style={styles.uploadHint}>{images.length}/5 images selected</Text>
            </TouchableOpacity>

            {/* Previews */}
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewList}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.previewContainer}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity onPress={() => removeImage(index)} style={styles.removeImageButton}>
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Pricing Packages</Text>
          {packages.map((pkg) => (
            <View key={pkg.name} style={[styles.packageCard, { backgroundColor: theme.card, borderLeftColor: getPackageColor(pkg.name) }]}>
              <View style={[styles.packageHeader, { backgroundColor: getPackageColor(pkg.name) + "15" }]}>
                <PackageIcon size={20} color={getPackageColor(pkg.name)} />
                <Text style={[styles.packageTitle, { color: getPackageColor(pkg.name) }]}>
                  {getPackageTitle(pkg.name)} Package
                </Text>
              </View>
              <View style={styles.packageContent}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.smallLabel}>Price (SAR) *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                      placeholder="0"
                      value={pkg.price}
                      onChangeText={(v) => updatePackage(pkg.name, "price", v)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.smallLabel}>Delivery Days *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                      placeholder="0"
                      value={pkg.deliveryDays}
                      onChangeText={(v) => updatePackage(pkg.name, "deliveryDays", v)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <Text style={styles.smallLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textAreaSmall, { backgroundColor: theme.background, color: theme.text }]}
                  placeholder="Package description..."
                  value={pkg.description}
                  onChangeText={(v) => updatePackage(pkg.name, "description", v)}
                  multiline
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.publishButton, (createGigMutation.isPending || isUploading) && styles.publishButtonDisabled]} 
          onPress={handlePublish}
          disabled={createGigMutation.isPending || isUploading}
        >
          {createGigMutation.isPending || isUploading ? (
            <ActivityIndicator size="small" color={BrandColors.white} />
          ) : (
            <Text style={styles.publishButtonText}>
              {isUploading ? "Uploading Images..." : "Publish Service"}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  smallLabel: { fontSize: 13, fontWeight: "600", color: BrandColors.gray600, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  textArea: { minHeight: 120, paddingTop: 14 },
  textAreaSmall: { minHeight: 80, paddingTop: 14 },
  categoriesScroll: { gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 2, borderColor: BrandColors.gray200, backgroundColor: BrandColors.white },
  categoryChipActive: { backgroundColor: BrandColors.primary + "15", borderColor: BrandColors.primary },
  categoryChipText: { fontSize: 14, fontWeight: "600", color: BrandColors.gray600 },
  categoryChipTextActive: { color: BrandColors.primary },
  tagInputContainer: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tagInput: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  addTagButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: BrandColors.primary, alignItems: "center", justifyContent: "center" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: BrandColors.primary + "15", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "600", color: BrandColors.primary },
  
  // Image Upload Styles
  uploadBox: { borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 32, alignItems: "center", gap: 8 },
  uploadText: { fontSize: 15, fontWeight: "600" },
  uploadHint: { fontSize: 13, color: BrandColors.gray500 },
  imagePreviewList: { flexDirection: 'row', marginTop: 12 },
  previewContainer: { marginRight: 12, position: 'relative' },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -6, right: -6, backgroundColor: BrandColors.error, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },

  packageCard: { borderRadius: 16, marginBottom: 16, borderLeftWidth: 4, elevation: 3, shadowOpacity: 0.06, shadowRadius: 12 },
  packageHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  packageTitle: { fontSize: 16, fontWeight: "700" },
  packageContent: { padding: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 16 },
  halfInput: { flex: 1 },
  publishButton: { backgroundColor: BrandColors.primary, paddingVertical: 16, borderRadius: 16, alignItems: "center", elevation: 6 },
  publishButtonText: { fontSize: 17, fontWeight: "700", color: BrandColors.white },
  publishButtonDisabled: { opacity: 0.6 },
  bottomPadding: { height: 40 },
});
