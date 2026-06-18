import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await api.get('/admin/stats'); if (r.data.success) setStats(r.data.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Platform Overview" subtitle="Admin Dashboard" />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}>
        <View style={styles.grid}>
          {[
            { label: 'Total PGs', value: stats?.totalPGs, icon: 'business-outline', color: colors.primary[600], bg: colors.primary[100] },
            { label: 'Total Owners', value: stats?.totalOwners, icon: 'person-outline', color: colors.info, bg: '#dbeafe' },
            { label: 'Total Tenants', value: stats?.totalTenants, icon: 'people-outline', color: colors.success, bg: '#ecfdf5' },
            { label: 'Active Rooms', value: stats?.activeRooms, icon: 'bed-outline', color: colors.warning, bg: '#fef3c7' },
          ].map(item => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}><Ionicons name={item.icon} size={24} color={item.color} /></View>
              <Text style={styles.statValue}>{item.value ?? '—'}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder },
  statIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

export default AdminDashboard;
