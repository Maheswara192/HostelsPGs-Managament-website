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

const TenantComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'Maintenance', description: '' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await tenantService.getComplaints(); if (r.success) setComplaints(r.data); }
    catch {} finally { setRefreshing(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async () => {
    if (!form.description) { Toast.show({ type: 'error', text1: 'Please describe the issue' }); return; }
    setSaving(true);
    try {
      const r = await tenantService.raiseComplaint(form);
      if (r.success) { Toast.show({ type: 'success', text1: 'Complaint submitted!' }); setShowModal(false); setForm({ category: 'Maintenance', description: '' }); fetch(); }
    } catch {} finally { setSaving(false); }
  };

  const statusType = (s) => ({ open: 'danger', 'in-progress': 'warning', resolved: 'success' }[s] || 'default');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.category}>{item.category}</Text>
        <Badge label={item.status} type={statusType(item.status)} />
      </View>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.date}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My Complaints" subtitle={`${complaints.length} total`} right={
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      <FlatList data={complaints} keyExtractor={i => i._id} renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No complaints raised</Text></View>}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Raise Complaint</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Category</Text>
            <View style={styles.catRow}>
              {['Maintenance', 'Electrical', 'Plumbing', 'Housekeeping', 'Other'].map(c => (
                <TouchableOpacity key={c} onPress={() => setForm(f => ({ ...f, category: c }))}
                  style={[styles.catChip, form.category === c && styles.catActive]}>
                  <Text style={[styles.catText, form.category === c && { color: colors.primary[600] }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input label="Describe the Issue" placeholder="Please describe your complaint in detail..." value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline numberOfLines={5} />
            <Button title="Submit Complaint" onPress={handleSubmit} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  category: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
  desc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  date: { fontSize: 11, color: colors.textMuted },
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

export default TenantComplaints;
