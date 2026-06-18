import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const Badge = ({ label, type = 'default', size = 'sm' }) => {
  const typeMap = {
    default: { bg: colors.primary[100], text: colors.primary[700] },
    success: { bg: colors.successBg, text: colors.success },
    warning: { bg: colors.warningBg, text: colors.warning },
    danger: { bg: colors.dangerBg, text: colors.danger },
    info: { bg: colors.infoBg, text: colors.info },
    purple: { bg: colors.primary[100], text: colors.primary[600] },
  };
  const t = typeMap[type] || typeMap.default;

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, size === 'lg' && styles.lg]}>
      <Text style={[styles.text, { color: t.text }, size === 'lg' && styles.lgText]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  lg: { paddingHorizontal: 12, paddingVertical: 5 },
  lgText: { fontSize: 13 },
});

export default Badge;
