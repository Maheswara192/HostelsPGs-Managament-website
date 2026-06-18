import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const passRef = useRef(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Please fill in all fields' });
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Toast.show({ type: 'error', text1: 'Login Failed', text2: result.message });
    }
    // On success: AppNavigator auto-redirects based on role
  };

  return (
    <LinearGradient colors={['#f5f3ff', '#ede9fe', '#f8fafc']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Logo / Brand */}
            <View style={styles.logoSection}>
              <View style={styles.logoBox}>
                <Text style={styles.logoLetter}>S</Text>
              </View>
              <Text style={styles.brandName}>StayManager</Text>
              <Text style={styles.brandTagline}>Hostel & PG Management</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
              <Text style={styles.heading}>Welcome back 👋</Text>
              <Text style={styles.subheading}>Sign in to your account</Text>

              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                blurOnSubmit={false}
              />
              <Input
                ref={passRef}
                label="Password"
                placeholder="Your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                rightIcon={showPass ? 'eye-off' : 'eye'}
                onRightIconPress={() => setShowPass(!showPass)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.loginBtn} />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
                <Text style={styles.registerText}>
                  Don't have an account?{' '}
                  <Text style={styles.registerBold}>Register as Owner</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: colors.primary[600],
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: colors.primary[600], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  logoLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  brandName: { fontSize: 26, fontWeight: '800', color: colors.primary[800] },
  brandTagline: { fontSize: 13, color: colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
  },
  heading: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },

  forgotLink: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, color: colors.primary[600], fontWeight: '600' },

  loginBtn: { marginTop: 4 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.surfaceBorder },
  orText: { marginHorizontal: 12, color: colors.textMuted, fontSize: 13 },

  registerLink: { alignItems: 'center' },
  registerText: { fontSize: 14, color: colors.textSecondary },
  registerBold: { color: colors.primary[600], fontWeight: '700' },
});

export default LoginScreen;
