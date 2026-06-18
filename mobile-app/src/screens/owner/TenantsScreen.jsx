import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const TenantsScreen = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await ownerService.getTenants();
      if (res.success) setTenants(res.data || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load tenants' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleDelete = (t) => {
    const tenantName = t.user_id?.name || 'Tenant';
    Alert.alert('Remove Tenant', `Are you sure you want to remove ${tenantName}? This deletes their account and frees the room.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await ownerService.deleteTenant(t._id);
            Toast.show({ type: 'success', text1: 'Tenant removed successfully' });
            fetchTenants();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to remove tenant' });
          }
        },
      },
    ]);
  };

  const filtered = tenants.filter(t =>
    t.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.user_id?.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.room_id?.number?.toString().includes(search) ||
    t.contact_number?.includes(search)
  );

  const renderTenant = ({ item }) => {
    const tenantName = item.user_id?.name || 'Tenant';
    const tenantEmail = item.user_id?.email || 'No email';
    const roomNo = item.room_id?.number || '—';
    const rentVal = item.rentAmount || 0;
    const statusLabel = item.status || 'active';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{tenantName[0]?.toUpperCase() || 'T'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.tenantName}>{tenantName}</Text>
            <Text style={styles.tenantEmail}>{tenantEmail}</Text>
            <Text style={styles.tenantRoom}>Room {roomNo} • {item.contact_number || '—'}</Text>
          </View>
          <Badge label={statusLabel} type={statusLabel === 'active' ? 'success' : statusLabel === 'on_notice' ? 'warning' : 'default'} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>Rent: ₹{rentVal}/mo</Text>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={styles.delText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Tenants" subtitle={`${tenants.length} registered`} />
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by name, email, or room..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderTenant}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTenants();
            }}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No tenants found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, color: colors.textPrimary, fontSize: 14 },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: colors.primary[600] },
  info: { flex: 1 },
  tenantName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  tenantEmail: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  tenantRoom: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 10 },
  footerText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  delBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fee2e2', borderRadius: 8 },
  delText: { fontSize: 12, fontWeight: '600', color: colors.danger },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default TenantsScreen;
