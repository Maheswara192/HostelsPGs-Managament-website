import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Stat card for dashboard numbers
export const StatsCard = ({ title, value, iconName, iconColor, iconBg }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: iconBg || colors.primary[100] }]}>
      <Text style={{ fontSize: 22, color: iconColor || colors.primary[600] }}>{value !== undefined ? '' : '?'}</Text>
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.title}>{title}</Text>
  </View>
);

// Generic card wrapper
const Card = ({ children, style }) => (
  <View style={[styles.genericCard, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    flex: 1, marginHorizontal: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  value: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  title: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

  genericCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
});

export default Card;
