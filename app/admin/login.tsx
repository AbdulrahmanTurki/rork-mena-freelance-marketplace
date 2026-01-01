import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase'; // Direct access to debug
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react-native';

export default function AdminLoginScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const runDiagnostics = async () => {
    if (!email || !password) return addLog('Please enter email/password');
    
    setLoading(true);
    setLogs(['Starting Diagnostics...']);

    try {
      // 1. Test Auth
      addLog(`Attempting Login: ${email}`);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        addLog(`❌ Auth Failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        addLog('❌ Auth succeeded but no User returned!?');
        setLoading(false);
        return;
      }
      addLog('✅ Auth Success. User ID: ' + authData.user.id);

      // 2. Test Admin Roles Table Read
      addLog('Testing "admin_roles" table read...');
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', authData.user.id);

      if (roleError) {
        addLog(`❌ Admin Role Fetch Error: ${roleError.message}`);
        addLog(`Code: ${roleError.code}, Details: ${roleError.details}`);
        setLoading(false);
        return;
      }

      if (!roleData || roleData.length === 0) {
        addLog('❌ Table read success, but NO ROWS found for this user.');
        addLog('ACTION: Run the SQL script to add the admin role again.');
      } else {
        addLog(`✅ Found Admin Role: ${JSON.stringify(roleData[0])}`);
        
        // 3. Test Profile Read
        addLog('Testing "profiles" table read...');
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', authData.user.id)
            .single();
            
        if (profileError) {
             addLog(`⚠️ Profile Warning: ${profileError.message}`);
        } else {
             addLog(`✅ Profile Found: ${profileData?.full_name}`);
        }

        addLog('--- DIAGNOSTICS PASSED ---');
        addLog('Redirecting to dashboard in 3 seconds...');
        setTimeout(() => {
            router.replace('/admin/(tabs)/dashboard');
        }, 3000);
      }

    } catch (err: any) {
      addLog(`❌ CRITICAL CRASH: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Debug Mode</Text>
        </View>

        {/* LOG WINDOW */}
        <View style={[styles.logWindow, { backgroundColor: '#1a1a1a', borderColor: theme.border }]}>
            <ScrollView nestedScrollEnabled>
                {logs.length === 0 ? (
                    <Text style={{color: '#666'}}>Logs will appear here...</Text>
                ) : (
                    logs.map((log, i) => (
                        <Text key={i} style={{color: log.includes('❌') ? '#ff4444' : log.includes('✅') ? '#00cc00' : '#ddd', marginBottom: 4, fontSize: 12}}>
                            {log}
                        </Text>
                    ))
                )}
            </ScrollView>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Email"
            placeholderTextColor={theme.tertiaryText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Password"
            placeholderTextColor={theme.tertiaryText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={runDiagnostics}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Running Tests...' : 'Run Diagnostics'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  logWindow: { height: 250, width: '100%', borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 20 },
  form: { width: '100%' },
  input: { height: 50, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1 },
  button: { height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
