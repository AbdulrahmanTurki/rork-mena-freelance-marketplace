import { BrandColors } from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  IdCard,
  Shield,
  Upload,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { supabase } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4;

interface VerificationData {
  fullNameArabic: string;
  fullNameEnglish: string;
  nationalIdOrIqama: string;
  dateOfBirth: string;
  nationality: string;
  gender: string;
  mobileNumber: string;
  email: string;
  city: string;
  idFrontPhoto: string | null;
  idBackPhoto: string | null;
  freelancePermitNumber: string;
  permitExpirationDate: string;
  permitDocument: string | null;
  otpVerified: boolean;
  emailVerified: boolean;
}

export default function VerificationOnboardingScreen() {
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verificationData, setVerificationData] = useState<VerificationData>({
    fullNameArabic: "",
    fullNameEnglish: "",
    nationalIdOrIqama: "",
    dateOfBirth: "",
    nationality: "Saudi Arabia",
    gender: "",
    mobileNumber: "",
    email: "",
    city: "",
    idFrontPhoto: null,
    idBackPhoto: null,
    freelancePermitNumber: "",
    permitExpirationDate: "",
    permitDocument: null,
    otpVerified: false,
    emailVerified: false,
  });

  const cities = [
    "Riyadh",
    "Jeddah",
    "Mecca",
    "Medina",
    "Dammam",
    "Khobar",
    "Tabuk",
    "Abha",
    "Najran",
    "Al Kharj",
  ];

  const formatDateInput = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2);
      if (cleaned.length >= 3) {
        formatted += '/' + cleaned.slice(2, 4);
        if (cleaned.length >= 5) {
          formatted += '/' + cleaned.slice(4, 8);
        }
      }
    }
    
    return formatted;
  };

  const handlePickImage = async (type: "idFront" | "idBack" | "permit") => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "permit" ? undefined : [16, 10],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (type === "idFront") {
        setVerificationData({ ...verificationData, idFrontPhoto: uri });
      } else if (type === "idBack") {
        setVerificationData({ ...verificationData, idBackPhoto: uri });
      } else if (type === "permit") {
        setVerificationData({ ...verificationData, permitDocument: uri });
      }
    }
  };

  const handleSendOTP = () => {
    if (!verificationData.mobileNumber || verificationData.mobileNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid mobile number");
      return;
    }
    setOtpSent(true);
    Alert.alert("OTP Sent", `Verification code sent to ${verificationData.mobileNumber}`);
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setVerificationData({ ...verificationData, otpVerified: true });
      Alert.alert("Success", "Mobile number verified successfully!");
    } else {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return !!(
          verificationData.fullNameArabic &&
          verificationData.fullNameEnglish &&
          verificationData.nationalIdOrIqama &&
          verificationData.dateOfBirth &&
          verificationData.nationality &&
          verificationData.mobileNumber &&
          verificationData.email &&
          verificationData.city &&
          verificationData.otpVerified
        );
      case 2:
        return !!(verificationData.idFrontPhoto && verificationData.idBackPhoto);
      case 3:
        return !!(
          verificationData.freelancePermitNumber &&
          verificationData.permitExpirationDate &&
          verificationData.permitDocument
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      Alert.alert("Incomplete Information", "Please fill all required fields");
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const convertDateToISO = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const [day, month, year] = parts;
    
    if (!day || !month || !year) return null;
    
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return null;
    
    return isoDate;
  };

  const uploadImageToStorage = async (uri: string, path: string): Promise<string | null> => {
    try {
      console.log('[Upload Image] Starting upload to path:', path);
      console.log('[Upload Image] URI:', uri);
      
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${path}.${fileExt}`;
      
      console.log('[Upload Image] File name:', fileName);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('[Upload Image] No active session');
        throw new Error('No active session');
      }
      
      console.log('[Upload Image] Session user ID:', session.user?.id);
      console.log('[Upload Image] Expected folder:', `${session.user?.id}`);

      let fileData: Blob | ArrayBuffer;
      let contentType = `image/${fileExt}`;
      
      if (Platform.OS === 'web') {
        console.log('[Upload Image] Web: fetching blob');
        const response = await fetch(uri);
        fileData = await response.blob();
        contentType = (fileData as Blob).type || contentType;
      } else {
        console.log('[Upload Image] Native: reading file as ArrayBuffer');
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`Failed to read file: ${response.status}`);
        }
        fileData = await response.arrayBuffer();
      }
      
      console.log('[Upload Image] File data prepared, type:', contentType);

      const { data, error } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, fileData, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error('[Upload Image] Supabase error:', error);
        console.error('[Upload Image] Error response:', JSON.stringify(error, null, 2));
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      console.log('[Upload Image] Upload successful, path:', data.path);

      const { data: publicUrlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      console.log('[Upload Image] Public URL:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('[Upload Image] Failed:', error?.message || error);
      if (error?.message?.includes('row-level security')) {
        console.error('[Upload Image] RLS policy violation - check storage policies');
      }
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    const startTime = Date.now();

    try {
      console.log('[Verification Submit] Starting submission...');
      
      const dateOfBirthISO = convertDateToISO(verificationData.dateOfBirth);
      const permitExpirationISO = convertDateToISO(verificationData.permitExpirationDate);
      
      if (!dateOfBirthISO) {
        Alert.alert("Error", "Invalid date of birth format. Please use DD/MM/YYYY");
        setIsSubmitting(false);
        return;
      }
      
      if (!permitExpirationISO) {
        Alert.alert("Error", "Invalid permit expiration date format. Please use DD/MM/YYYY");
        setIsSubmitting(false);
        return;
      }

      console.log('[Verification Submit] Converting dates (took ' + (Date.now() - startTime) + 'ms)');

      const uploadStartTime = Date.now();
      console.log('[Verification Submit] Starting document uploads...');
      
      const uploadPromises = [];
      
      if (verificationData.idFrontPhoto) {
        uploadPromises.push(
          uploadImageToStorage(
            verificationData.idFrontPhoto,
            `${user.id}/id_front_${Date.now()}`
          )
        );
      }

      if (verificationData.idBackPhoto) {
        uploadPromises.push(
          uploadImageToStorage(
            verificationData.idBackPhoto,
            `${user.id}/id_back_${Date.now()}`
          )
        );
      }

      if (verificationData.permitDocument) {
        uploadPromises.push(
          uploadImageToStorage(
            verificationData.permitDocument,
            `${user.id}/permit_${Date.now()}`
          )
        );
      }

      const uploadResults = await Promise.all(uploadPromises);
      console.log('[Verification Submit] Uploads completed (took ' + (Date.now() - uploadStartTime) + 'ms)');
      
      const [idFrontUrl, idBackUrl, permitDocumentUrl] = uploadResults;

      if (!idFrontUrl || !idBackUrl || !permitDocumentUrl) {
        Alert.alert("Error", "Failed to upload one or more documents. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const profileStartTime = Date.now();
      console.log('[Verification Submit] Updating profile...');
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: verificationData.fullNameEnglish,
          full_name_arabic: verificationData.fullNameArabic,
          national_id: verificationData.nationalIdOrIqama,
          date_of_birth: dateOfBirthISO,
          nationality: verificationData.nationality,
          gender: verificationData.gender || null,
          mobile_number: verificationData.mobileNumber,
          email: verificationData.email,
          city: verificationData.city,
        })
        .eq("id", user.id);

      console.log('[Verification Submit] Profile update completed (took ' + (Date.now() - profileStartTime) + 'ms)');

      if (profileError) {
        console.error("Error updating profile:", profileError);
        Alert.alert("Error", `Failed to update profile: ${profileError.message || JSON.stringify(profileError)}`);
        setIsSubmitting(false);
        return;
      }

      const verificationStartTime = Date.now();
      console.log('[Verification Submit] Creating verification record...');
      
      const { error: verificationError } = await supabase
        .from("seller_verifications")
        .insert({
          user_id: user.id,
          status: "pending",
          permit_number: verificationData.freelancePermitNumber,
          permit_expiration_date: permitExpirationISO,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          permit_document_url: permitDocumentUrl,
        });

      console.log('[Verification Submit] Verification record created (took ' + (Date.now() - verificationStartTime) + 'ms)');

      if (verificationError) {
        console.error("Error creating verification:", verificationError);
        Alert.alert("Error", `Failed to submit verification: ${verificationError.message || JSON.stringify(verificationError)}`);
        setIsSubmitting(false);
        return;
      }

      console.log('[Verification Submit] Total submission time: ' + (Date.now() - startTime) + 'ms');
      console.log('[Verification Submit] Refreshing user data...');
      
      refreshUser(user.id, user.email).catch(err => {
        console.error('[Verification Submit] User refresh failed (non-blocking):', err);
      });
      
      setIsSubmitting(false);
      
      Alert.alert(
        "Success",
        "Your verification request has been submitted successfully. Our admin team will review it within 1-3 business days.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/seller/verification-pending"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      Alert.alert("Error", `Failed to submit verification: ${error?.message || String(error)}`);
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[
            styles.progressStep,
            {
              backgroundColor:
                currentStep >= step ? BrandColors.primary : theme.border,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stepHeader, { backgroundColor: theme.card }]}>
        <User size={32} color={BrandColors.primary} />
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Identity Information
        </Text>
        <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
          Please provide your official identity details as they appear on your
          ID/Iqama
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Full Name (Arabic) *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.fullNameArabic}
            onChangeText={(text) =>
              setVerificationData({ ...verificationData, fullNameArabic: text })
            }
            placeholder="الاسم الكامل بالعربية"
            placeholderTextColor={theme.tertiaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Full Name (English) *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.fullNameEnglish}
            onChangeText={(text) =>
              setVerificationData({ ...verificationData, fullNameEnglish: text })
            }
            placeholder="Full Name in English"
            placeholderTextColor={theme.tertiaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            National ID / Iqama Number *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.nationalIdOrIqama}
            onChangeText={(text) =>
              setVerificationData({
                ...verificationData,
                nationalIdOrIqama: text,
              })
            }
            placeholder="Enter 10-digit ID number"
            placeholderTextColor={theme.tertiaryText}
            keyboardType="number-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Date of Birth *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.dateOfBirth}
            onChangeText={(text) => {
              const formatted = formatDateInput(text);
              setVerificationData({ ...verificationData, dateOfBirth: formatted });
            }}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.tertiaryText}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Nationality *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.nationality}
            onChangeText={(text) =>
              setVerificationData({ ...verificationData, nationality: text })
            }
            placeholder="Enter your nationality"
            placeholderTextColor={theme.tertiaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Gender (Optional)
          </Text>
          <View style={styles.genderContainer}>
            {["Male", "Female"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  {
                    backgroundColor:
                      verificationData.gender === option
                        ? BrandColors.primary + "20"
                        : theme.card,
                    borderColor:
                      verificationData.gender === option
                        ? BrandColors.primary
                        : theme.border,
                  },
                ]}
                onPress={() =>
                  setVerificationData({ ...verificationData, gender: option })
                }
              >
                <Text
                  style={[
                    styles.genderText,
                    {
                      color:
                        verificationData.gender === option
                          ? BrandColors.primary
                          : theme.text,
                    },
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Mobile Number *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.mobileNumber}
            onChangeText={(text) =>
              setVerificationData({ ...verificationData, mobileNumber: text })
            }
            placeholder="+966 5X XXX XXXX"
            placeholderTextColor={theme.tertiaryText}
            keyboardType="phone-pad"
          />
          {!verificationData.otpVerified && (
            <TouchableOpacity
              style={[styles.otpButton, otpSent && styles.otpButtonDisabled]}
              onPress={handleSendOTP}
              disabled={otpSent}
            >
              <Text style={styles.otpButtonText}>
                {otpSent ? "OTP Sent" : "Send OTP"}
              </Text>
            </TouchableOpacity>
          )}

          {otpSent && !verificationData.otpVerified && (
            <View style={styles.otpContainer}>
              <TextInput
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={theme.tertiaryText}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyOTP}
              >
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
          )}

          {verificationData.otpVerified && (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={16} color={BrandColors.secondary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Email *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.email}
            onChangeText={(text) =>
              setVerificationData({ ...verificationData, email: text })
            }
            placeholder="your.email@example.com"
            placeholderTextColor={theme.tertiaryText}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            City of Residence *
          </Text>
          <View style={styles.cityGrid}>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityOption,
                  {
                    backgroundColor:
                      verificationData.city === city
                        ? BrandColors.primary + "20"
                        : theme.card,
                    borderColor:
                      verificationData.city === city
                        ? BrandColors.primary
                        : theme.border,
                  },
                ]}
                onPress={() =>
                  setVerificationData({ ...verificationData, city })
                }
              >
                <Text
                  style={[
                    styles.cityText,
                    {
                      color:
                        verificationData.city === city
                          ? BrandColors.primary
                          : theme.text,
                    },
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stepHeader, { backgroundColor: theme.card }]}>
        <IdCard size={32} color={BrandColors.primary} />
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Identity Documents
        </Text>
        <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
          Upload clear photos of your National ID or Iqama (front and back)
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.uploadSection}>
          <Text style={[styles.uploadLabel, { color: theme.text }]}>
            ID/Iqama Front Photo *
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              {
                backgroundColor: theme.card,
                borderColor: verificationData.idFrontPhoto
                  ? BrandColors.secondary
                  : theme.border,
              },
            ]}
            onPress={() => handlePickImage("idFront")}
          >
            {verificationData.idFrontPhoto ? (
              <Image
                source={{ uri: verificationData.idFrontPhoto }}
                style={styles.uploadedImage}
              />
            ) : (
              <>
                <Upload size={32} color={BrandColors.primary} />
                <Text style={[styles.uploadText, { color: theme.text }]}>
                  Tap to upload front photo
                </Text>
                <Text
                  style={[styles.uploadHint, { color: theme.secondaryText }]}
                >
                  Clear, well-lit photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.uploadSection}>
          <Text style={[styles.uploadLabel, { color: theme.text }]}>
            ID/Iqama Back Photo *
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              {
                backgroundColor: theme.card,
                borderColor: verificationData.idBackPhoto
                  ? BrandColors.secondary
                  : theme.border,
              },
            ]}
            onPress={() => handlePickImage("idBack")}
          >
            {verificationData.idBackPhoto ? (
              <Image
                source={{ uri: verificationData.idBackPhoto }}
                style={styles.uploadedImage}
              />
            ) : (
              <>
                <Upload size={32} color={BrandColors.primary} />
                <Text style={[styles.uploadText, { color: theme.text }]}>
                  Tap to upload back photo
                </Text>
                <Text
                  style={[styles.uploadHint, { color: theme.secondaryText }]}
                >
                  Clear, well-lit photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: BrandColors.blue + "15" }]}>
          <AlertCircle size={20} color={BrandColors.blue} />
          <Text style={[styles.infoText, { color: BrandColors.blue }]}>
            Make sure all information on the ID is clearly visible and
            readable. Blurry or incomplete photos will be rejected.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stepHeader, { backgroundColor: theme.card }]}>
        <Shield size={32} color={BrandColors.primary} />
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Freelance Permit
        </Text>
        <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
          Provide your Saudi Freelance Document (وثيقة العمل الحر) details
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Freelance Permit Number *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.freelancePermitNumber}
            onChangeText={(text) =>
              setVerificationData({
                ...verificationData,
                freelancePermitNumber: text,
              })
            }
            placeholder="Enter permit number"
            placeholderTextColor={theme.tertiaryText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Permit Expiration Date *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={verificationData.permitExpirationDate}
            onChangeText={(text) => {
              const formatted = formatDateInput(text);
              setVerificationData({
                ...verificationData,
                permitExpirationDate: formatted,
              });
            }}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={theme.tertiaryText}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.uploadSection}>
          <Text style={[styles.uploadLabel, { color: theme.text }]}>
            Freelance Permit Document *
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              {
                backgroundColor: theme.card,
                borderColor: verificationData.permitDocument
                  ? BrandColors.secondary
                  : theme.border,
              },
            ]}
            onPress={() => handlePickImage("permit")}
          >
            {verificationData.permitDocument ? (
              <>
                <Image
                  source={{ uri: verificationData.permitDocument }}
                  style={styles.uploadedImage}
                />
                <Text
                  style={[
                    styles.documentChange,
                    { color: BrandColors.primary },
                  ]}
                >
                  Tap to change
                </Text>
              </>
            ) : (
              <>
                <Upload size={32} color={BrandColors.primary} />
                <Text style={[styles.uploadText, { color: theme.text }]}>
                  Tap to upload permit document
                </Text>
                <Text
                  style={[styles.uploadHint, { color: theme.secondaryText }]}
                >
                  PDF or image format
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: BrandColors.amber + "15" }]}>
          <AlertCircle size={20} color={BrandColors.amber} />
          <Text style={[styles.infoText, { color: BrandColors.amber }]}>
            Your freelance permit must be valid and issued by the Saudi Ministry
            of Human Resources. Expired permits will not be accepted.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stepHeader, { backgroundColor: theme.card }]}>
        <CheckCircle size={32} color={BrandColors.secondary} />
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Review & Submit
        </Text>
        <Text style={[styles.stepDescription, { color: theme.secondaryText }]}>
          Please review your information before submitting
        </Text>
      </View>

      <View style={styles.form}>
        <View style={[styles.reviewSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.reviewTitle, { color: theme.text }]}>
            Personal Information
          </Text>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Full Name (English):
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.fullNameEnglish}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Full Name (Arabic):
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.fullNameArabic}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              ID/Iqama Number:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.nationalIdOrIqama}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Date of Birth:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.dateOfBirth}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Nationality:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.nationality}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Mobile:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.mobileNumber}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Email:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.email}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              City:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.city}
            </Text>
          </View>
        </View>

        <View style={[styles.reviewSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.reviewTitle, { color: theme.text }]}>
            Documents
          </Text>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              ID Front Photo:
            </Text>
            <View style={styles.checkmark}>
              <CheckCircle size={16} color={BrandColors.secondary} />
            </View>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              ID Back Photo:
            </Text>
            <View style={styles.checkmark}>
              <CheckCircle size={16} color={BrandColors.secondary} />
            </View>
          </View>
        </View>

        <View style={[styles.reviewSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.reviewTitle, { color: theme.text }]}>
            Freelance Permit
          </Text>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Permit Number:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.freelancePermitNumber}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Expiration Date:
            </Text>
            <Text style={[styles.reviewValue, { color: theme.text }]}>
              {verificationData.permitExpirationDate}
            </Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: theme.secondaryText }]}>
              Permit Document:
            </Text>
            <View style={styles.checkmark}>
              <CheckCircle size={16} color={BrandColors.secondary} />
            </View>
          </View>
        </View>

        <View
          style={[
            styles.infoBox,
            { backgroundColor: BrandColors.secondary + "15" },
          ]}
        >
          <AlertCircle size={20} color={BrandColors.secondary} />
          <Text style={[styles.infoText, { color: BrandColors.secondary }]}>
            Your application will be reviewed by our admin team. You will
            receive a notification once the verification is complete. This
            usually takes 1-3 business days.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "Seller Verification",
          headerStyle: {
            backgroundColor: theme.headerBackground,
          },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerLeft: () =>
            currentStep > 1 ? (
              <TouchableOpacity onPress={handlePrevious} style={styles.headerButton}>
                <ArrowLeft size={24} color={theme.text} />
              </TouchableOpacity>
            ) : undefined,
        }}
      />

      {renderProgressBar()}

      <View style={styles.content}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </View>

      <View style={[styles.footer, { backgroundColor: theme.card }]}>
        {currentStep < 4 ? (
          <TouchableOpacity
            style={[
              styles.nextButton,
              !validateStep(currentStep) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!validateStep(currentStep)}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
            <ArrowRight size={20} color={BrandColors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={BrandColors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Review</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  stepHeader: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  genderText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  otpButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  otpButtonDisabled: {
    backgroundColor: BrandColors.gray300,
  },
  otpButtonText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  otpContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  verifyButton: {
    backgroundColor: BrandColors.secondary,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
  },
  verifyButtonText: {
    color: BrandColors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
  },
  verifiedText: {
    color: BrandColors.secondary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  cityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cityOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cityText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  uploadSection: {
    gap: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 8,
    minHeight: 180,
    justifyContent: "center",
  },
  uploadedImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  uploadHint: {
    fontSize: 13,
  },
  documentUploaded: {
    alignItems: "center",
    gap: 12,
  },
  documentName: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  documentChange: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewSection: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  reviewLabel: {
    fontSize: 14,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    flex: 1,
    textAlign: "right",
  },
  checkmark: {
    padding: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BrandColors.gray200,
  },
  nextButton: {
    backgroundColor: BrandColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: BrandColors.gray300,
  },
  nextButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  submitButton: {
    backgroundColor: BrandColors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
