import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import tenantService from '../../services/tenant.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const VisitorsScreen = () => {
  const [visitors, setVisitors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', visitDate: '', purpose: 'Visit' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await tenantService.getPreAuthVisitors(); if (r.success) setVisitors(r.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.visitDate) { Toast.show({ type: 'error', text1: 'Visitor name and date required' }); return; }
    setSaving(true);
    try {
      const r = await tenantService.createPreAuthVisitor(form);
      if (r.success) { Toast.show({ type: 'success', text1: 'Visitor pre-authorized!' }); setShowModal(false); setForm({ name: '', phone: '', visitDate: '', purpose: 'Visit' }); fetch(); }
    } catch { Toast.show({ type: 'error', text1: 'Failed to add visitor' }); }
    finally { setSaving(false); }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase() || 'V'}</Text></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.phone || '—'} • {item.visitDate ? new Date(item.visitDate).toLocaleDateString() : '—'}</Text>
          <Text style={styles.purpose}>{item.purpose || ''}</Text>
          <Text style={[styles.purpose, { fontFamily: 'monospace', fontSize: 10, color: colors.textMuted }]}>TOKEN: {item.qrCodeToken}</Text>
        </View>
        <Badge label={item.status || 'PENDING'} type={{ CHECKED_IN: 'success', PENDING: 'warning', EXPIRED: 'default' }[item.status] || 'default'} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Visitors" subtitle="Pre-authorized" right={
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      <FlatList data={visitors} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No visitors pre-authorized</Text></View>}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pre-Authorize Visitor</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Input label="Visitor Name" placeholder="Full name" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} autoCapitalize="words" />
            <Input label="Phone Number" placeholder="10-digit number" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />
            <Input label="Visit Date" placeholder="YYYY-MM-DD" value={form.visitDate} onChangeText={v => setForm(f => ({ ...f, visitDate: v }))} />
            <Input label="Purpose" placeholder="e.g. Delivery, Visit, Maintenance" value={form.purpose} onChangeText={v => setForm(f => ({ ...f, purpose: v }))} />
            <Button title="Pre-Authorize" onPress={handleAdd} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#cffafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#0891b2' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  purpose: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
});

export default VisitorsScreen;
