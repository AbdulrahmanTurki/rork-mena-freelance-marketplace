import { BrandColors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OnboardingMode = "welcome" | "login" | "signup" | "signup-seller";

const FIVERR_GREEN = "#1dbf73";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, signup, continueAsGuest, signInWithGoogle } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const [mode, setMode] = useState<OnboardingMode>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? "يرجى إدخال البريد الإلكتروني وكلمة المرور"
          : "Please enter email and password"
      );
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        Alert.alert(
          language === "ar" ? "فشل تسجيل الدخول" : "Login Failed",
          result.error
        );
      } else {
        router.replace("/");
      }
    } catch (error) {
      Alert.alert(
        language === "ar" ? "فشل تسجيل الدخول" : "Login Failed",
        language === "ar"
          ? "بيانات الاعتماد غير صحيحة"
          : "Invalid credentials"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (isSeller: boolean) => {
    if (!email || !password || !name) {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? "يرجى ملء جميع الحقول"
          : "Please fill in all fields"
      );
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const userType = isSeller ? "seller" : "buyer";
      console.log("[Onboarding] Signing up as:", userType);
      const result = await signup(email, password, name, userType);
      if (result.error) {
        console.error("[Onboarding] Signup error:", result.error);
        console.error("[Onboarding] Full error string:", JSON.stringify(result.error));
        
        let errorTitle = language === "ar" ? "فشل التسجيل" : "Signup Failed";
        let errorMessage = result.error;
        
        if (result.error.includes('rate limit') || result.error.includes('Too many')) {
          errorTitle = language === "ar" ? "محاولات كثيرة" : "Too Many Attempts";
          if (language === "ar") {
            errorMessage = "تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار 5 دقائق والمحاولة مرة أخرى، أو استخدام بريد إلكتروني آخر.";
          }
        }
        
        Alert.alert(errorTitle, errorMessage);
      } else {
        console.log("[Onboarding] Signup successful for type:", userType);
        
        // For sellers, redirect directly to verification onboarding
        if (isSeller) {
          console.log("[Onboarding] Seller signup - redirecting to verification-onboarding");
          router.replace("/seller/verification-onboarding");
        } else {
          console.log("[Onboarding] Buyer signup - redirecting to home");
          router.replace("/(tabs)/home");
        }
      }
    } catch (error) {
      console.error("[Onboarding] Signup exception:", error);
      if (error instanceof Error) {
        console.error("[Onboarding] Exception message:", error.message);
        console.error("[Onboarding] Exception stack:", error.stack);
      }
      console.error("[Onboarding] Exception as string:", JSON.stringify(error));
      Alert.alert(
        language === "ar" ? "فشل التسجيل" : "Signup Failed",
        language === "ar"
          ? "حدث خطأ أثناء إنشاء الحساب"
          : "An error occurred while creating your account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    setIsLoading(true);
    try {
      await continueAsGuest();
      router.replace("/(tabs)/home");
    } catch {
      Alert.alert(
        language === "ar" ? "خطأ" : "Error",
        language === "ar"
          ? "حدث خطأ، يرجى المحاولة مرة أخرى"
          : "An error occurred, please try again"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        Alert.alert(
          language === "ar" ? "فشل تسجيل الدخول" : "Sign In Failed",
          result.error
        );
      } else {
        router.replace("/");
      }
    } catch (error) {
      Alert.alert(
        language === "ar" ? "فشل تسجيل الدخول" : "Sign In Failed",
        language === "ar"
          ? "حدث خطأ أثناء تسجيل الدخول باستخدام Google"
          : "An error occurred while signing in with Google"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  if (mode === "welcome") {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {language === "ar" ? "خدمة" : "Khedmah"}
            </Text>
            <Text style={styles.subtitle}>
              {language === "ar"
                ? "سوق الخدمات المستقلة"
                : "Find the perfect freelance services"}
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                resetForm();
                setMode("signup");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {language === "ar" ? "الانضمام كمشتري" : "Join as Buyer"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sellerButton}
              onPress={() => {
                resetForm();
                setMode("signup-seller");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.sellerButtonText}>
                {language === "ar" ? "الانضمام كبائع" : "Become a Seller"}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => setMode("login")}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>
                {language === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestContinue}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#74767e" />
              ) : (
                <Text style={styles.guestButtonText}>
                  {language === "ar"
                    ? "متابعة كزائر"
                    : "Continue as Guest"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => changeLanguage(language === "ar" ? "en" : "ar")}
              activeOpacity={0.85}
            >
              <Text style={styles.languageButtonText}>
                {language === "ar" ? "🇬🇧 English" : "🇦🇪 العربية"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.formHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            resetForm();
            setMode("welcome");
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={24}
            color="#62646a"
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.formTitleContainer}>
            <Text style={styles.formTitle}>
              {mode === "login" && (language === "ar" ? "تسجيل الدخول" : "Sign in to Khedmah")}
              {mode === "signup" &&
                (language === "ar" ? "إنشاء حساب" : "Sign up to hire talent")}
              {mode === "signup-seller" &&
                (language === "ar" ? "التسجيل كبائع" : "Sign up to start selling")}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
            activeOpacity={0.85}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#74767e" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>
                  {language === "ar" ? "متابعة باستخدام Google" : "Continue with Google"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerTextSmall}>
              {language === "ar" ? "أو" : "OR"}
            </Text>
            <View style={styles.divider} />
          </View>

          {(mode === "signup" || mode === "signup-seller") && (
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder={language === "ar" ? "الاسم الكامل" : "Full name"}
                placeholderTextColor="#b5b6ba"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
              placeholderTextColor="#b5b6ba"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder={language === "ar" ? "كلمة المرور" : "Password"}
              placeholderTextColor="#b5b6ba"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={() => {
              if (mode === "login") {
                handleLogin();
              } else {
                handleSignup(mode === "signup-seller");
              }
            }}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === "login" &&
                  (language === "ar" ? "متابعة" : "Continue")}
                {(mode === "signup" || mode === "signup-seller") &&
                  (language === "ar" ? "إنشاء حساب" : "Create account")}
              </Text>
            )}
          </TouchableOpacity>

          {mode === "login" && (
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>
                {language === "ar"
                  ? "ليس لديك حساب؟"
                  : "Not a member yet?"}{" "}
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setMode("signup");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchModeLink}>
                    {language === "ar" ? "سجل الآن" : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          )}

          {(mode === "signup" || mode === "signup-seller") && (
            <View style={styles.switchModeContainer}>
              <Text style={styles.switchModeText}>
                {language === "ar" ? "لديك حساب؟" : "Already a member?"}{" "}
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setMode("login");
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchModeLink}>
                    {language === "ar" ? "سجل الدخول" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#404145",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: "#62646a",
    textAlign: "center",
  },
  buttonsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: FIVERR_GREEN,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  sellerButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c5c6c9",
  },
  sellerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#404145",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e4e5e7",
  },
  dividerTextSmall: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: "#95979d",
    paddingHorizontal: 16,
  },
  loginButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c5c6c9",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#404145",
  },
  guestButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guestButtonText: {
    fontSize: 14,
    color: "#74767e",
    fontWeight: "500" as const,
  },
  languageButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  languageButtonText: {
    fontSize: 14,
    color: "#74767e",
    fontWeight: "500" as const,
  },
  formHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e5e7",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  formScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formContainer: {
    gap: 16,
  },
  formTitleContainer: {
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#404145",
    letterSpacing: -0.5,
  },
  inputGroup: {
    gap: 0,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c5c6c9",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#404145",
  },
  googleButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#c5c6c9",
    gap: 10,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#404145",
  },
  submitButton: {
    backgroundColor: FIVERR_GREEN,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  switchModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  switchModeText: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: "#74767e",
  },
  switchModeLink: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: FIVERR_GREEN,
  },
});
