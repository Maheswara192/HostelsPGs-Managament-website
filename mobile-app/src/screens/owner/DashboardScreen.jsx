import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import ownerService from '../../services/owner.service';
import { colors } from '../../theme/colors';

const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={textColor} />
    </View>
    <Text style={styles.statValue}>{value ?? '—'}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const QuickAction = ({ label, icon, color, onPress }) => (
  <TouchableOpacity style={styles.quickBtn} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.quickIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await ownerService.getDashboardStats();
      if (res.success) setStats(res.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  const navigate = (screen) => navigation.navigate(screen);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good morning 🏠</Text>
            <Text style={styles.name}>{user?.name || 'Owner'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Gradient Banner */}
        <LinearGradient colors={colors.gradientPrimary} style={styles.banner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.bannerContent}>
            <Ionicons name="shield-checkmark" size={28} color="rgba(255,255,255,0.9)" />
            <View style={{ marginLeft: 14, flex: 1 }}>
              <Text style={styles.bannerTitle}>System Secure</Text>
              <Text style={styles.bannerSubtitle}>All data encrypted & backed up</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Tenants" value={stats?.tenants} icon="people" bgColor="#ede9fe" textColor={colors.primary[600]} />
          <StatCard title="Occupancy" value={stats?.occupancy ? `${stats.occupancy}%` : '—'} icon="bed" bgColor="#dbeafe" textColor={colors.info} />
          <StatCard title="Pending Rent" value={stats?.pendingRent ? `₹${stats.pendingRent}` : '₹0'} icon="card" bgColor="#fef3c7" textColor={colors.warning} />
          <StatCard title="Complaints" value={stats?.complaints} icon="alert-circle" bgColor="#fee2e2" textColor={colors.danger} />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction label="Add Tenant" icon="person-add" color={colors.primary[600]} onPress={() => navigate('Tenants')} />
          <QuickAction label="Rooms" icon="bed" color={colors.info} onPress={() => navigate('Rooms')} />
          <QuickAction label="Record Rent" icon="card" color={colors.success} onPress={() => navigate('Payments')} />
          <QuickAction label="Post Notice" icon="megaphone" color={colors.warning} onPress={() => navigate('More')} />
          <QuickAction label="Complaints" icon="alert-circle" color={colors.danger} onPress={() => navigate('More')} />
          <QuickAction label="Mess Menu" icon="restaurant" color="#f97316" onPress={() => navigate('More')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  logoutBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 10 },

  banner: { borderRadius: 20, padding: 20, marginBottom: 24 },
  bannerContent: { flexDirection: 'row', alignItems: 'center' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  bannerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80', marginRight: 5 },
  liveText: { fontSize: 11, color: '#fff', fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%', backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  statIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  statTitle: { fontSize: 12, color: colors.textMuted, fontWeight: '500', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickBtn: {
    width: '30%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    borderWidth: 1, borderColor: colors.surfaceBorder,
  },
  quickIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
});

export default DashboardScreen;
