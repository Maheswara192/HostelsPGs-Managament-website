import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const Input = forwardRef(({
  label, placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default',
  error, autoCapitalize = 'none', editable = true, multiline = false, numberOfLines = 1,
  rightIcon, onRightIconPress, returnKeyType, onSubmitEditing, blurOnSubmit
}, ref) => {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputError, !editable && styles.disabled]}>
        <TextInput
          ref={ref}
          style={[styles.input, multiline && { textAlignVertical: 'top', height: numberOfLines * 24 + 20 }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1.5,
    borderColor: colors.surfaceBorder, borderRadius: 12,
    paddingHorizontal: 14, minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 12 },
  rightIcon: { padding: 4 },
  inputError: { borderColor: colors.danger },
  disabled: { backgroundColor: '#f1f5f9', opacity: 0.7 },
  errorText: { fontSize: 12, color: colors.danger, marginTop: 4, marginLeft: 2 },
});

export default Input;
