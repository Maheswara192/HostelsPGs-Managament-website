import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import authService from '../../services/auth.service';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password, 3: Success

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your email' });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      Toast.show({ type: 'success', text1: 'OTP code sent to your email!' });
      setStep(2);
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: e.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter the OTP code' });
      return;
    }
    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(email.trim().toLowerCase(), otp.trim(), password);
      if (res.success) {
        setStep(3);
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2000);
      } else {
        Toast.show({ type: 'error', text1: res.message || 'Reset failed' });
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: e.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-closed" size={28} color={colors.primary[600]} />
              </View>
            </View>
            <Text style={styles.heading}>Forgot Password?</Text>
            <Text style={styles.subheading}>Enter your email and we will send you a 6-digit OTP code to reset your password</Text>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button title="Send OTP Code" onPress={handleRequestOtp} loading={loading} style={{ marginTop: 8 }} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Back to <Text style={{ color: colors.primary[600], fontWeight: '700' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.iconRow}>
              <View style={styles.iconBox}>
                <Ionicons name="key" size={28} color={colors.primary[600]} />
              </View>
            </View>
            <Text style={styles.heading}>Reset Password</Text>
            <Text style={styles.subheading}>Enter the 6-digit OTP sent to {email} and choose a new password</Text>
            <Input
              label="OTP Code"
              placeholder="XXXXXX"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Confirm Password"
              placeholder="Repeat new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
            <Button title="Set New Password" onPress={handleResetPassword} loading={loading} style={{ marginTop: 8 }} />
            <TouchableOpacity onPress={() => setStep(1)} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                Resend OTP / <Text style={{ color: colors.primary[600], fontWeight: '700' }}>Change Email</Text>
              </Text>
            </TouchableOpacity>
          </>
        );
      case 3:
        return (
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={56} color={colors.success} />
            </View>
            <Text style={styles.heading}>Password Reset!</Text>
            <Text style={styles.subheading}>Your password has been successfully updated. Redirecting to login...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#f5f3ff', '#ede9fe', '#f8fafc']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>{renderContent()}</View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  back: { padding: 16 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  iconRow: { alignItems: 'center', marginBottom: 20 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  successBox: { alignItems: 'center', paddingVertical: 16 },
  successIcon: { marginBottom: 16 },
});

export default ForgotPasswordScreen;
