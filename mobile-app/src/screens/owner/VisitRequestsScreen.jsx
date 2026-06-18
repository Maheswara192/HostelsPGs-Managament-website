import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ownerService from '../../services/owner.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import { colors } from '../../theme/colors';

const statuses = ['Pending', 'Contacted', 'Scheduled', 'Visited', 'Converted', 'Closed'];

const VisitRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetch = async () => {
    try {
      const r = await ownerService.getVisitRequests();
      if (r.success) setRequests(r.data || []);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to fetch visit requests' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await ownerService.updateVisitStatus(id, { status: newStatus });
      Toast.show({ type: 'success', text1: `Status updated to ${newStatus}` });
      setShowStatusModal(false);
      setSelectedRequest(null);
      fetch();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update status' });
    }
  };

  const getStatusType = (s) => {
    switch (s) {
      case 'Pending': return 'warning';
      case 'Contacted': return 'info';
      case 'Scheduled': return 'primary';
      case 'Visited': return 'accent';
      case 'Converted': return 'success';
      case 'Closed': return 'default';
      default: return 'default';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.visitorMeta}>
          <View style={styles.iconBox}>
            <Ionicons name="person-outline" size={18} color={colors.primary[600]} />
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.date}>Requested: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</Text>
          </View>
        </View>
        <Badge label={item.status || 'Pending'} type={getStatusType(item.status)} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        {item.email ? (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>
            Visit Date: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{item.visitDate ? new Date(item.visitDate).toLocaleDateString() : '—'}</Text>
          </Text>
        </View>
        {item.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>"{item.notes}"</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={() => {
          setSelectedRequest(item);
          setShowStatusModal(true);
        }}
        style={styles.updateBtn}
      >
        <Text style={styles.updateBtnText}>Update Status</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.primary[600]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Visit Requests" subtitle={`${requests.filter(r => r.status === 'Pending').length} pending leads`} />
      <FlatList
        data={requests}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetch();
            }}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No visit requests found</Text>
          </View>
        }
      />

      {/* Status Picker Modal */}
      <Modal visible={showStatusModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeading}>Update Lead Status</Text>
            <Text style={styles.modalSubheading}>For visitor: {selectedRequest?.name}</Text>
            <View style={styles.optionsList}>
              {statuses.map(st => (
                <TouchableOpacity
                  key={st}
                  onPress={() => handleUpdateStatus(selectedRequest?._id, st)}
                  style={[styles.optionItem, selectedRequest?.status === st && styles.optionItemActive]}
                >
                  <Text style={[styles.optionText, selectedRequest?.status === st && styles.optionTextActive]}>{st}</Text>
                  {selectedRequest?.status === st && (
                    <Ionicons name="checkmark" size={18} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowStatusModal(false);
                setSelectedRequest(null);
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: 14,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  visitorMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 15, fontWeight: '750', color: colors.textPrimary },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  cardBody: { gap: 6, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, paddingBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13, color: colors.textSecondary },
  notesBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  notesText: { fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', lineHeight: 18 },
  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  updateBtnText: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, width: '100%', maxWidth: 300, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  modalHeading: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  modalSubheading: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  optionsList: { gap: 4 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: colors.background },
  optionItemActive: { backgroundColor: colors.primary[50] },
  optionText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  optionTextActive: { color: colors.primary[700], fontWeight: '700' },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
});

export default VisitRequestsScreen;
