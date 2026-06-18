import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const { registerOwner } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', pgName: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const refs = { email: useRef(null), pgName: useRef(null), password: useRef(null), confirm: useRef(null) };

  const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.pgName || !form.password) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }
    if (form.password !== form.confirm) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }
    if (form.password.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    const result = await registerOwner(form.name, form.email, form.password, form.pgName);
    setLoading(false);
    if (!result.success) Toast.show({ type: 'error', text1: 'Registration Failed', text2: result.message });
  };

  return (
    <LinearGradient colors={['#f5f3ff', '#ede9fe', '#f8fafc']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.logoSection}>
              <View style={styles.logoBox}><Text style={styles.logoLetter}>S</Text></View>
              <Text style={styles.brandName}>Register Your PG</Text>
              <Text style={styles.brandTagline}>Start managing in minutes</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.subheading}>Fill in the details below</Text>

              <Input label="Your Name" placeholder="John Doe" value={form.name} onChangeText={update('name')} autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => refs.email.current?.focus()} blurOnSubmit={false} />
              <Input ref={refs.email} label="Email Address" placeholder="you@example.com" value={form.email} onChangeText={update('email')} keyboardType="email-address" returnKeyType="next" onSubmitEditing={() => refs.pgName.current?.focus()} blurOnSubmit={false} />
              <Input ref={refs.pgName} label="PG / Hostel Name" placeholder="e.g. Green Valley PG" value={form.pgName} onChangeText={update('pgName')} autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => refs.password.current?.focus()} blurOnSubmit={false} />
              <Input ref={refs.password} label="Password" placeholder="Min 8 characters" value={form.password} onChangeText={update('password')} secureTextEntry returnKeyType="next" onSubmitEditing={() => refs.confirm.current?.focus()} blurOnSubmit={false} />
              <Input ref={refs.confirm} label="Confirm Password" placeholder="Repeat password" value={form.confirm} onChangeText={update('confirm')} secureTextEntry returnKeyType="done" onSubmitEditing={handleRegister} />

              <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: colors.primary[600], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  logoLetter: { fontSize: 30, fontWeight: '800', color: '#fff' },
  brandName: { fontSize: 22, fontWeight: '800', color: colors.primary[800] },
  brandTagline: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: colors.textSecondary },
  loginBold: { color: colors.primary[600], fontWeight: '700' },
});

export default RegisterScreen;
