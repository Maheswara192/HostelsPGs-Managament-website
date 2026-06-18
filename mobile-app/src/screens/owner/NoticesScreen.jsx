import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const NoticesScreen = () => {
  const [notices, setNotices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', priority: 'Normal' });
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = async () => {
    try { const r = await ownerService.getNotices(); if (r.success) setNotices(r.data); }
    catch {} finally { setRefreshing(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.content) { Toast.show({ type: 'error', text1: 'Title and content required' }); return; }
    setSaving(true);
    try {
      const r = await ownerService.createNotice(form);
      if (r.success) { Toast.show({ type: 'success', text1: 'Notice posted!' }); setShowModal(false); setForm({ title: '', content: '', priority: 'Normal' }); fetch(); }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = (id) => Alert.alert('Delete Notice', 'Remove this notice?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await ownerService.deleteNotice(id); fetch(); } }
  ]);

  const priorityColor = (p) => ({ Urgent: colors.danger, Normal: colors.success, Info: colors.info }[p] || colors.textMuted);

  const renderNotice = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.priorityDot, { backgroundColor: priorityColor(item.priority) }]} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.del}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Notices" subtitle="Board" right={
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      <FlatList data={notices} keyExtractor={i => i._id} renderItem={renderNotice}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.primary[500]} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="megaphone-outline" size={48} color={colors.textMuted} /><Text style={styles.emptyText}>No notices posted</Text></View>}
      />
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post Notice</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={26} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Input label="Title" placeholder="Notice title" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
            <Input label="Content" placeholder="Notice content..." value={form.content} onChangeText={v => setForm(f => ({ ...f, content: v }))} multiline numberOfLines={5} />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {['Normal', 'Urgent', 'Info'].map(p => (
                <TouchableOpacity key={p} onPress={() => setForm(f => ({ ...f, priority: p }))}
                  style={[styles.pChip, form.priority === p && { backgroundColor: priorityColor(p), borderColor: priorityColor(p) }]}>
                  <Text style={[styles.pText, form.priority === p && { color: '#fff' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Post Notice" onPress={handleCreate} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  content: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  del: { padding: 4 },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: colors.surfaceBorder, backgroundColor: colors.surface },
  pText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});

export default NoticesScreen;
