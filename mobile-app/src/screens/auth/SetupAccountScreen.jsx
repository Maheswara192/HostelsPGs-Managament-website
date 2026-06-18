import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const SetupAccountScreen = ({ route, navigation }) => {
  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { setupAccount } = useAuth();

  const handleSetup = async () => {
    if (!password || password.length < 6) { Toast.show({ type: 'error', text1: 'Password must be at least 6 characters' }); return; }
    if (password !== confirm) { Toast.show({ type: 'error', text1: 'Passwords do not match' }); return; }
    setLoading(true);
    try {
      const result = await setupAccount(token, password);
      if (result.success) {
        Toast.show({ type: 'success', text1: 'Account setup complete!' });
      } else {
        Toast.show({ type: 'error', text1: result.message || 'Setup failed' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: e.message || 'Setup failed' });
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={['#f5f3ff', '#ede9fe', '#f8fafc']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.heading}>Set Your Password</Text>
            <Text style={styles.subheading}>Choose a secure password to complete your account setup</Text>
            <Input label="New Password" placeholder="Min 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
            <Input label="Confirm Password" placeholder="Repeat password" value={confirm} onChangeText={setConfirm} secureTextEntry returnKeyType="done" onSubmitEditing={handleSetup} />
            <Button title="Complete Setup" onPress={handleSetup} loading={loading} style={{ marginTop: 8 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
});

export default SetupAccountScreen;
