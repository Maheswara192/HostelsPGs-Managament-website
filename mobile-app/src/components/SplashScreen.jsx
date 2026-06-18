import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const SplashScreen = () => (
  <LinearGradient colors={colors.gradientDark} style={styles.container}>
    <View style={styles.logoBox}>
      <Text style={styles.logoText}>S</Text>
    </View>
    <Text style={styles.title}>StayManager</Text>
    <Text style={styles.subtitle}>Hostel & PG Management</Text>
    <ActivityIndicator color={colors.primary[400]} size="large" style={styles.spinner} />
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: colors.primary[600],
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: colors.primary[500], shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  logoText: { fontSize: 40, fontWeight: '800', color: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.primary[300], marginBottom: 40 },
  spinner: { marginTop: 20 },
});

export default SplashScreen;
