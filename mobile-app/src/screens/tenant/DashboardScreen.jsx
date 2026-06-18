import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import tenantService from '../../services/tenant.service';
import { colors } from '../../theme/colors';

const TenantDashboard = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try {
      const [dashRes, payRes, compRes, noticeRes] = await Promise.all([
        tenantService.getDashboard(),
        tenantService.getPayments(),
        tenantService.getComplaints(),
        tenantService.getNotices()
      ]);

      const dashData = dashRes.success ? dashRes.data : {};
      const paymentsData = payRes.success ? payRes.data : { payments: [], rentAmount: 0, messDues: 0 };
      const complaintsData = compRes.success ? compRes.data : [];
      const noticesData = noticeRes.success ? noticeRes.data : [];

      const pendingCount = (paymentsData.rentAmount + paymentsData.messDues > 0) ? 1 : 0;
      const openComplaintsCount = complaintsData.filter(c => c.status !== 'Resolved').length;
      const noticesCount = noticesData.length;

      setData({
        ...dashData,
        pendingPayments: pendingCount,
        openComplaints: openComplaintsCount,
        notices: noticesCount,
        recentNotices: noticesData
      });
    }
    catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to load dashboard' });
    }
    finally { setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>My Room 🏠</Text>
            <Text style={styles.name}>{user?.name || 'Tenant'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Room Card */}
        <LinearGradient colors={colors.gradientPrimary} style={styles.roomCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="bed-outline" size={32} color="rgba(255,255,255,0.9)" />
          <View style={styles.roomInfo}>
            <Text style={styles.roomLabel}>Your Room</Text>
            <Text style={styles.roomNum}>Room {data?.room?.number || '—'}</Text>
            <Text style={styles.roomType}>{data?.room?.type || '—'} • {data?.pg?.name || '—'}</Text>
          </View>
          <View style={styles.rentBox}>
            <Text style={styles.rentLabel}>Monthly Rent</Text>
            <Text style={styles.rentAmt}>₹{data?.room?.price || '—'}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fffbeb' }]}><Ionicons name="card-outline" size={20} color={colors.warning} /></View>
            <Text style={styles.statVal}>{data?.pendingPayments || 0}</Text>
            <Text style={styles.statLbl}>Pending Payments</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="alert-circle-outline" size={20} color={colors.danger} /></View>
            <Text style={styles.statVal}>{data?.openComplaints || 0}</Text>
            <Text style={styles.statLbl}>Open Complaints</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#ecfdf5' }]}><Ionicons name="megaphone-outline" size={20} color={colors.success} /></View>
            <Text style={styles.statVal}>{data?.notices || 0}</Text>
            <Text style={styles.statLbl}>Notices</Text>
          </View>
        </View>

        {/* Recent Notices */}
        {data?.recentNotices?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            {data.recentNotices.slice(0, 3).map(n => (
              <View key={n._id} style={styles.noticeCard}>
                <Ionicons name="megaphone-outline" size={18} color={colors.primary[600]} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>{n.title}</Text>
                  <Text style={styles.noticeSub}>{n.content?.slice(0, 80)}...</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  logoutBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 10 },
  roomCard: { borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  roomInfo: { flex: 1 },
  roomLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  roomNum: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  roomType: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  rentBox: { alignItems: 'flex-end' },
  rentLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  rentAmt: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.surfaceBorder },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statVal: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  statLbl: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  noticeCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: colors.surfaceBorder, marginBottom: 8 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  noticeSub: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});

export default TenantDashboard;
