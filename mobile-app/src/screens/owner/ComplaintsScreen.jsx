import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const ComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await ownerService.getComplaints(); if (r.success) setComplaints(r.data); }
    catch { Toast.show({ type: 'error', text1: 'Failed to load complaints' }); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await ownerService.updateComplaintStatus(id, { status });
      Toast.show({ type: 'success', text1: `Marked as ${status}` });
      fetch();
    } catch { Toast.show({ type: 'error', text1: 'Update failed' }); }
  };

  const typeColor = (s) => ({ open: 'danger', 'in-progress': 'warning', resolved: 'success' }[s] || 'default');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.tenant?.name?.[0] || 'T'}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.tenant?.name || 'Tenant'} • Room {item.roomNumber || '—'}</Text>
          <Text style={styles.category}>{item.category || 'General'}</Text>
        </View>
        <Badge label={item.status} type={typeColor(item.status)} />
      </View>
      <Text style={styles.description}>{item.description}</Text>
      {item.status === 'open' && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => updateStatus(item._id, 'in-progress')} style={[styles.actionBtn, { backgroundColor: '#fffbeb' }]}>
            <Text style={[styles.actionText, { color: colors.warning }]}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => updateStatus(item._id, 'resolved')} style={[styles.actionBtn, { backgroundColor: '#ecfdf5' }]}>
            <Text style={[styles.actionText, { color: colors.success }]}>Resolve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Complaints" subtitle={`${complaints.filter(c => c.status === 'open').length} open`} />
      <FlatList data={complaints} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No complaints</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.primary[600] },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  category: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default ComplaintsScreen;
