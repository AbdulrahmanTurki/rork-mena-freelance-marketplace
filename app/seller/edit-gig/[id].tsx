import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  Plus,
  X,
  FileImage,
  Clock,
  Package as PackageIcon,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker"; 
import { supabase } from "@/lib/supabase";

type PricingPackage = {
  name: "basic" | "standard" | "premium";
  price: string;
  deliveryDays: string;
  description: string;
  features: string[];
};

export default function EditGigScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [packages, setPackages] = useState<PricingPackage[]>([
    { name: "basic", price: "", deliveryDays: "", description: "", features: [""] },
    { name: "standard", price: "", deliveryDays: "", description: "", features: [""] },
    { name: "premium", price: "", deliveryDays: "", description: "", features: [""] },
  ]);

  useEffect(() => {
    if (!id) return;
    fetchGigDetails();
  }, [id]);

  const fetchGigDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setDescription(data.description);
      setSelectedCategory(data.category_id);
      setTags(data.tags || []);
      setImages(data.images || []);

      if (data.packages && Array.isArray(data.packages)) {
        const updatedPackages = packages.map(pkg => {
            const found = data.packages.find((p: any) => p.name === pkg.name);
            if (found) {
                return {
                    name: pkg.name,
                    price: found.price.toString(),
                    deliveryDays: found.deliveryDays.toString(),
                    description: found.description,
                    features: found.features || [""]
                };
            }
            return pkg;
        });
        setPackages(updatedPackages);
      }
    } catch (error) {
      console.error('Error fetching gig:', error);
      Alert.alert("Error", "Could not load service details.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
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
      Alert.alert('Error', 'Could not open gallery.');
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
  const handleRemoveTag = (index: number) => setTags(tags.filter((_, i) => i !== index));

  const updatePackage = (name: string, field: string, value: string) => {
    setPackages(prev => prev.map(p => p.name === name ? { ...p, [field]: value } : p));
  };
  const addFeature = (name: string) => {
    setPackages(prev => prev.map(p => p.name === name ? { ...p, features: [...p.features, ""] } : p));
  };
  const updateFeature = (name: string, idx: number, val: string) => {
    setPackages(prev => prev.map(p => p.name === name ? { ...p, features: p.features.map((f, i) => i === idx ? val : f) } : p));
  };
  const removeFeature = (name: string, idx: number) => {
    setPackages(prev => prev.map(p => p.name === name ? { ...p, features: p.features.filter((_, i) => i !== idx) } : p));
  };

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const finalImageUrls: string[] = [];

      for (const img of images) {
        if (img.startsWith('http')) {
          finalImageUrls.push(img);
        } else {
          const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const formData = new FormData();
          // @ts-ignore
          formData.append('file', { uri: img, name: filename, type: 'image/jpeg' });

          const { error: uploadError } = await supabase.storage
            .from('gig-images')
            .upload(filename, formData, { contentType: 'image/jpeg' });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage.from('gig-images').getPublicUrl(filename);
          finalImageUrls.push(data.publicUrl);
        }
      }

      const packagesData = packages.map(pkg => ({
        name: pkg.name,
        price: parseFloat(pkg.price || "0"),
        deliveryDays: parseInt(pkg.deliveryDays || "0"),
        description: pkg.description,
        features: pkg.features.filter(f => f.trim() !== ""),
      })).filter(pkg => pkg.price > 0);

      const basicPkg = packagesData.find(p => p.name === "basic");
      
      const { error } = await supabase
        .from('gigs')
        .update({
            title,
            description,
            category_id: selectedCategory,
            price: basicPkg ? basicPkg.price : 0,
            delivery_time: basicPkg ? basicPkg.deliveryDays : 0,
            tags,
            images: finalImageUrls, 
            packages: packagesData
        })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['seller-gigs'] }); 
      Alert.alert("Success", "Service updated successfully!", [{ text: "OK", onPress: () => router.back() }]);

    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Failed to update service");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={BrandColors.primary} /></View>;
  }

  const getPackageColor = (name: string) => {
    if (name === 'basic') return '#4CAF50';
    if (name === 'standard') return BrandColors.primary;
    return BrandColors.accent;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: "Edit Service", headerBackTitle: "Back" }} />
        
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <Text style={[styles.label, {color: theme.text}]}>Title</Text>
                <TextInput style={[styles.input, {color: theme.text, backgroundColor: theme.card}]} value={title} onChangeText={setTitle} />
                
                <Text style={[styles.label, {color: theme.text, marginTop: 16}]}>Description</Text>
                <TextInput style={[styles.input, styles.textArea, {color: theme.text, backgroundColor: theme.card}]} value={description} onChangeText={setDescription} multiline />
            </View>

            {/* --- FIXED IMAGE CONTAINER --- */}
            <View style={styles.section}>
                <Text style={[styles.label, {color: theme.text}]}>Images</Text>
                
                {/* 1. Main Dashed Box Container */}
                <View style={[styles.uploadBox, {borderColor: theme.border, backgroundColor: theme.card}]}>
                    
                    {/* 2. Top Part: "Add Images" Button */}
                    <TouchableOpacity onPress={pickImage} style={styles.uploadPlaceholder}>
                        <FileImage size={32} color={BrandColors.gray400} />
                        <Text style={[styles.uploadText, {color: theme.text}]}>
                           {images.length > 0 ? "Add More Images" : "Upload Images"}
                        </Text>
                        <Text style={styles.uploadHint}>{images.length}/5 images selected</Text>
                    </TouchableOpacity>

                    {/* 3. Bottom Part: Image List (INSIDE the box now) */}
                    {images.length > 0 && (
                        <View style={styles.imageListContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {images.map((uri, idx) => (
                                    <View key={idx} style={styles.previewContainer}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity onPress={() => removeImage(idx)} style={styles.removeBtn}>
                                            <X size={12} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
            {/* ----------------------------- */}

            <View style={styles.section}>
                <Text style={[styles.label, {color: theme.text}]}>Tags</Text>
                <View style={{flexDirection: 'row', gap: 8}}>
                    <TextInput style={[styles.input, {flex: 1, backgroundColor: theme.card, color: theme.text}]} value={tagInput} onChangeText={setTagInput} placeholder="Add tag" placeholderTextColor={theme.tertiaryText} />
                    <TouchableOpacity onPress={handleAddTag} style={styles.addBtn}><Plus color="#fff" /></TouchableOpacity>
                </View>
                <View style={styles.tagsRow}>
                    {tags.map((t, i) => (
                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{t}</Text><TouchableOpacity onPress={()=>handleRemoveTag(i)}><X size={12} color={BrandColors.primary}/></TouchableOpacity></View>
                    ))}
                </View>
            </View>

            <Text style={[styles.sectionTitle, {color: theme.text}]}>Packages</Text>
            {packages.map((pkg) => (
                <View key={pkg.name} style={[styles.pkgCard, {backgroundColor: theme.card, borderLeftColor: getPackageColor(pkg.name)}]}>
                    <Text style={[styles.pkgTitle, {color: getPackageColor(pkg.name)}]}>{pkg.name.toUpperCase()}</Text>
                    <View style={styles.row}>
                        <View style={{flex: 1}}>
                            <Text style={styles.smallLabel}>Price</Text>
                            <TextInput style={[styles.input, {backgroundColor: theme.background, color: theme.text}]} value={pkg.price} onChangeText={v => updatePackage(pkg.name, 'price', v)} keyboardType="numeric" />
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={styles.smallLabel}>Days</Text>
                            <TextInput style={[styles.input, {backgroundColor: theme.background, color: theme.text}]} value={pkg.deliveryDays} onChangeText={v => updatePackage(pkg.name, 'deliveryDays', v)} keyboardType="numeric" />
                        </View>
                    </View>
                    <Text style={styles.smallLabel}>Description</Text>
                    <TextInput style={[styles.input, {backgroundColor: theme.background, color: theme.text, height: 60}]} multiline value={pkg.description} onChangeText={v => updatePackage(pkg.name, 'description', v)} />
                    <Text style={styles.smallLabel}>Features</Text>
                    {pkg.features.map((f, i) => (
                        <View key={i} style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                            <TextInput style={[styles.input, {flex: 1, height: 40, backgroundColor: theme.background, color: theme.text}]} value={f} onChangeText={v => updateFeature(pkg.name, i, v)} />
                            <TouchableOpacity onPress={()=>removeFeature(pkg.name, i)} style={styles.removeFeatureBtn}><X size={14} color="red"/></TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity onPress={()=>addFeature(pkg.name)}><Text style={{color: BrandColors.primary, fontWeight: '600'}}>+ Add Feature</Text></TouchableOpacity>
                </View>
            ))}

            <TouchableOpacity onPress={handleUpdate} disabled={saving} style={[styles.saveBtn, saving && {opacity: 0.7}]}>
                {saving ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
            <View style={{height: 40}} />
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  
  // --- UPDATED UPLOAD CONTAINER STYLES ---
  uploadBox: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center',
    gap: 10 // Space between placeholder and images
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10
  },
  uploadText: { fontSize: 15, fontWeight: "600", marginTop: 8 },
  uploadHint: { fontSize: 13, color: BrandColors.gray500 },
  
  imageListContainer: {
    marginTop: 10,
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee', // Light separator line inside the box
  },
  previewContainer: { marginRight: 10, position: 'relative' },
  
  // FIXED SIZE: 80x80 matches Create Gig
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  
  removeBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: BrandColors.error, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
  // ----------------------------------------

  addBtn: { backgroundColor: BrandColors.primary, width: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E0F2F1', padding: 8, borderRadius: 16 },
  tagText: { color: BrandColors.primary, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  pkgCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4 },
  pkgTitle: { fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  removeFeatureBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { backgroundColor: BrandColors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
