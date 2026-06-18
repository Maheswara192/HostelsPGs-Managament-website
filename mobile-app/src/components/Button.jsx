import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const Button = ({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) => {
  const variantStyles = {
    primary: { bg: colors.primary[600], text: '#fff' },
    outline: { bg: 'transparent', text: colors.primary[600], borderWidth: 2, borderColor: colors.primary[600] },
    danger: { bg: colors.danger, text: '#fff' },
    ghost: { bg: 'transparent', text: colors.textSecondary },
  };
  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderWidth: v.borderWidth || 0, borderColor: v.borderColor || 'transparent' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <Text style={[styles.text, { color: v.text }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', minHeight: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  text: { fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  disabled: { opacity: 0.55 },
});

export default Button;
