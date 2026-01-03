import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAdmin } from '@/contexts/AdminContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Lock, Mail, ArrowRight } from 'lucide-react-native';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { loginAdmin } = useAdmin();
  const { theme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting admin login...');
      const success = await loginAdmin(email, password);
      
      if (success) {
        console.log('Login successful, redirecting to dashboard...');
        // FORCE Redirect to the Admin Dashboard
        router.replace('/admin/(tabs)/dashboard');
      } else {
        Alert.alert('Login Failed', 'Invalid credentials or insufficient permissions.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Lock size={40} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Admin Access</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                Enter your credentials to continue
            </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={theme.tertiaryText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
              placeholder="Email"
              placeholderTextColor={theme.tertiaryText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={theme.tertiaryText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border }]}
              placeholder="Password"
              placeholderTextColor={theme.tertiaryText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Login to Dashboard</Text>
                <ArrowRight size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { flex: 1, height: 56, borderRadius: 12, paddingLeft: 48, paddingRight: 16, borderWidth: 1 },
  button: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
