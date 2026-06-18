import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const RoomsScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ number: '', type: 'Single', capacity: '1', price: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const fetchRooms = async () => {
    try {
      const res = await ownerService.getRooms();
      if (res.success) setRooms(res.data || []);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load rooms' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAdd = () => {
    setEditRoom(null);
    setForm({ number: '', type: 'Single', capacity: '1', price: '' });
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      number: room.number,
      type: room.type,
      capacity: String(room.capacity),
      price: String(room.price)
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.number || !form.price) {
      Toast.show({ type: 'error', text1: 'Room number and price are required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        number: form.number,
        type: form.type,
        capacity: parseInt(form.capacity),
        price: parseFloat(form.price)
      };
      const res = editRoom
        ? await ownerService.updateRoom(editRoom._id, payload)
        : await ownerService.createRoom(payload);

      if (res.success) {
        Toast.show({ type: 'success', text1: editRoom ? 'Room updated!' : 'Room created!' });
        setShowModal(false);
        fetchRooms();
      } else {
        Toast.show({ type: 'error', text1: res.message || 'Operation failed' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (room) => {
    Alert.alert('Delete Room', `Delete Room ${room.number}? This will also affect assigned tenants.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ownerService.deleteRoom(room._id);
            Toast.show({ type: 'success', text1: 'Room deleted' });
            fetchRooms();
          } catch {
            Toast.show({ type: 'error', text1: 'Delete failed' });
          }
        }
      }
    ]);
  };

  const statusColor = (s) => {
    const isOccupied = s === 'Occupied' || s === 'occupied';
    const isVacant = s === 'Vacant' || s === 'vacant';
    return isOccupied ? 'danger' : isVacant ? 'success' : 'warning';
  };

  const getRoomStatusLabel = (room) => {
    if (room.occupied >= room.capacity) return 'Occupied';
    if (room.occupied > 0) return 'Semi-Occupied';
    return 'Vacant';
  };

  const filtered = filter === 'All'
    ? rooms
    : rooms.filter(r => getRoomStatusLabel(r) === filter);

  const renderRoom = ({ item }) => {
    const statusLabel = getRoomStatusLabel(item);
    return (
      <View style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomNumBox}>
            <Ionicons name="bed-outline" size={18} color={colors.primary[600]} />
            <Text style={styles.roomNum}>Room {item.number}</Text>
          </View>
          <Badge label={statusLabel} type={statusColor(statusLabel)} />
        </View>
        <View style={styles.roomDetails}>
          <Text style={styles.detail}>🏠 {item.type} • Occupancy: {item.occupied}/{item.capacity} person(s)</Text>
          <Text style={styles.detail}>💰 ₹{item.price}/month</Text>
        </View>
        <View style={styles.roomActions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={colors.primary[600]} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
            <Ionicons name="trash" size={16} color={colors.danger} />
            <Text style={styles.delText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filters = ['All', 'Vacant', 'Semi-Occupied', 'Occupied'];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Rooms" subtitle={`${rooms.length} total`} right={
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      } />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderRoom}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchRooms();
            }}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bed-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No rooms found</Text>
          </View>
        }
      />
      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editRoom ? 'Edit Room' : 'Add New Room'}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Input
              label="Room Number"
              placeholder="e.g. 101"
              value={form.number}
              onChangeText={v => setForm(f => ({ ...f, number: v }))}
            />
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              {['Single', 'Double', 'Triple', 'Dorm'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm(f => ({ ...f, type: t }))}
                  style={[styles.typeChip, form.type === t && styles.typeActive]}
                >
                  <Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Input
              label="Capacity"
              placeholder="Number of people"
              value={form.capacity}
              onChangeText={v => setForm(f => ({ ...f, capacity: v }))}
              keyboardType="numeric"
            />
            <Input
              label="Monthly Price (₹)"
              placeholder="e.g. 5000"
              value={form.price}
              onChangeText={v => setForm(f => ({ ...f, price: v }))}
              keyboardType="numeric"
            />
            <Button title={editRoom ? 'Update Room' : 'Create Room'} onPress={handleSave} loading={saving} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  filterRow: { maxHeight: 56 },
  filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.surfaceBorder },
  filterActive: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12, paddingBottom: 30 },
  roomCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roomNumBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roomNum: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  roomDetails: { gap: 4, marginBottom: 12 },
  detail: { fontSize: 13, color: colors.textSecondary },
  roomActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.primary[50], borderRadius: 8 },
  editText: { fontSize: 13, fontWeight: '600', color: colors.primary[600] },
  delBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fee2e2', borderRadius: 8 },
  delText: { fontSize: 13, fontWeight: '600', color: colors.danger },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: colors.surfaceBorder, backgroundColor: colors.surface },
  typeActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  typeText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  typeTextActive: { color: colors.primary[600] },
});

export default RoomsScreen;
