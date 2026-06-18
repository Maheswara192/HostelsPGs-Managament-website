import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const PGManagementScreen = () => {
  const [pgs, setPgs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = async () => {
    try { const r = await api.get('/admin/pgs'); if (r.data.success) setPgs(r.data.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}><Ionicons name="business-outline" size={22} color={colors.primary[600]} /></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>Owner: {item.owner?.name || '—'} • {item.city || '—'}</Text>
          <Text style={styles.sub}>Rooms: {item.totalRooms || 0} • Tenants: {item.totalTenants || 0}</Text>
        </View>
        <Badge label={item.status || 'active'} type={{ active: 'success', inactive: 'danger' }[item.status] || 'default'} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="All PGs" subtitle={`${pgs.length} registered`} />
      <FlatList data={pgs} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="business-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No PGs registered</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default PGManagementScreen;
