import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const ScreenHeader = ({ title, subtitle, right }) => (
  <SafeAreaView edges={['top']} style={styles.safe}>
    <View style={styles.header}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, paddingTop: 4,
    borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
  },
  left: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  right: { marginLeft: 12 },
});

export default ScreenHeader;
