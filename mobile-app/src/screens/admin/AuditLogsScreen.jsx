import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const AuditLogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const fetch = async () => {
    try { const r = await api.get('/admin/logs'); if (r.data.success) setLogs(r.data.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}><Ionicons name="document-text-outline" size={18} color={colors.textSecondary} /></View>
        <View style={styles.info}>
          <Text style={styles.action}>{item.action}</Text>
          <Text style={styles.sub}>By: {item.user?.name || '—'} • {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Audit Logs" subtitle="System activity" />
      <FlatList data={logs} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="document-text-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No audit logs</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 8, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.surfaceBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  info: { flex: 1 },
  action: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default AuditLogsScreen;
