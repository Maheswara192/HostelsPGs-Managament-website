import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const InventoryScreen = () => {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await api.get('/inventory'); if (r.data.success) setItems(r.data.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}><Ionicons name="cube-outline" size={20} color="#6366f1" /></View>
        <View style={styles.info}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.sub}>Category: {item.category || '—'} • Qty: {item.quantity}</Text>
        </View>
        <Badge label={item.quantity > 5 ? 'OK' : 'Low'} type={item.quantity > 5 ? 'success' : 'danger'} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Inventory" subtitle={`${items.length} items`} />
      <FlatList data={items} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="cube-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No inventory items</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0e7ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default InventoryScreen;
