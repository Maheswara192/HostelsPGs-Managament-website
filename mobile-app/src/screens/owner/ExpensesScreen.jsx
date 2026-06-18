import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const ExpensesScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Maintenance', amount: '', description: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await ownerService.getExpenses(); if (r.success) setExpenses(r.data); }
    catch {} finally { setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async () => {
    if (!form.amount || !form.description) { Toast.show({ type: 'error', text1: 'Amount and description required' }); return; }
    setSaving(true);
    try {
      const r = await ownerService.addExpense(form);
      if (r.success) { Toast.show({ type: 'success', text1: 'Expense added!' }); setShowModal(false); setForm({ category: 'Maintenance', amount: '', description: '', date: '' }); fetch(); }
    } catch {} finally { setSaving(false); }
  };

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const catColor = { Maintenance: 'warning', Utility: 'info', Salary: 'purple', Others: 'default' };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}><Ionicons name="trending-up-outline" size={20} color={colors.info} /></View>
        <View style={styles.info}>
          <Text style={styles.desc}>{item.description}</Text>
          <Text style={styles.date}>{item.category} • {item.date ? new Date(item.date).toLocaleDateString() : ''}</Text>
        </View>
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Expenses" subtitle="Financial tracking" right={
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Expenses</Text>
        <Text style={styles.totalValue}>₹{total.toLocaleString()}</Text>
      </View>
      <FlatList data={expenses} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="wallet-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No expenses recorded</Text></View>}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              {['Maintenance', 'Utility', 'Salary', 'Others'].map(c => (
                <TouchableOpacity key={c} onPress={() => setForm(f => ({ ...f, category: c }))}
                  style={[styles.catChip, form.category === c && styles.catActive]}>
                  <Text style={[styles.catText, form.category === c && { color: colors.primary[600] }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Amount (₹)" placeholder="e.g. 2000" value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="numeric" />
            <Input label="Description" placeholder="What was this for?" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} />
            <Input label="Date" placeholder="YYYY-MM-DD" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
            <Button title="Add Expense" onPress={handleAdd} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  totalCard: { margin: 16, backgroundColor: colors.primary[600], borderRadius: 16, padding: 20 },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  totalValue: { fontSize: 32, fontWeight: '800', color: '#fff' },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  desc: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.danger },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: colors.surfaceBorder },
  catActive: { borderColor: colors.primary[300], backgroundColor: colors.primary[50] },
  catText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});

export default ExpensesScreen;
