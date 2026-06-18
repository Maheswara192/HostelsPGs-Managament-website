import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const PaymentsScreen = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tenantId: '', amount: '', month: '', note: '' });
  const [saving, setSaving] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await ownerService.getPayments();
      if (res.success) setPayments(res.data);
    } catch { Toast.show({ type: 'error', text1: 'Failed to load payments' }); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleRecord = async () => {
    if (!form.amount || !form.month) { Toast.show({ type: 'error', text1: 'Amount and month are required' }); return; }
    setSaving(true);
    try {
      const res = await ownerService.recordManualPayment(form);
      if (res.success) { Toast.show({ type: 'success', text1: 'Payment recorded!' }); setShowModal(false); fetchPayments(); }
      else Toast.show({ type: 'error', text1: res.message });
    } catch { Toast.show({ type: 'error', text1: 'Failed to record' }); }
    finally { setSaving(false); }
  };

  const statusType = (s) => ({ paid: 'success', pending: 'warning', overdue: 'danger' }[s] || 'default');

  const renderPayment = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}><Ionicons name="card-outline" size={22} color={colors.success} /></View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.tenant?.name || 'Unknown'}</Text>
          <Text style={styles.sub}>Room {item.roomNumber || '—'} • {item.month || ''}</Text>
        </View>
        <View style={styles.amountCol}>
          <Text style={styles.amount}>₹{item.amount}</Text>
          <Badge label={item.status || 'pending'} type={statusType(item.status)} />
        </View>
      </View>
      {item.note && <Text style={styles.note}>📝 {item.note}</Text>}
    </View>
  );

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Payments" subtitle="Revenue overview" right={
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.summaryLabel}>Collected</Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>₹{totalPaid.toLocaleString()}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fffbeb' }]}>
          <Text style={styles.summaryLabel}>Pending</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>₹{totalPending.toLocaleString()}</Text>
        </View>
      </View>
      <FlatList
        data={payments}
        keyExtractor={i => i._id}
        renderItem={renderPayment}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="card-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No payments yet</Text></View>}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Input label="Tenant ID" placeholder="Tenant user ID" value={form.tenantId} onChangeText={v => setForm(f => ({ ...f, tenantId: v }))} />
            <Input label="Amount (₹)" placeholder="e.g. 5000" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="numeric" />
            <Input label="Month" placeholder="e.g. June 2025" value={form.month} onChangeText={v => setForm(f => ({ ...f, month: v }))} />
            <Input label="Note (optional)" placeholder="Any remarks" value={form.note} onChangeText={v => setForm(f => ({ ...f, note: v }))} multiline numberOfLines={3} />
            <Button title="Record Payment" onPress={handleRecord} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  summaryRow: { flexDirection: 'row', gap: 12, padding: 16 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 14 },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amountCol: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  note: { fontSize: 12, color: colors.textMuted, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.surfaceBorder },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
});

export default PaymentsScreen;
