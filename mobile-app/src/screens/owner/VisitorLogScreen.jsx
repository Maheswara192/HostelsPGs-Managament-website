import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import securityService from '../../services/security.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { colors } from '../../theme/colors';

const VisitorLogScreen = () => {
  const [activeTab, setActiveTab] = useState('visitors'); // visitors | requests | preauth
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [preAuthList, setPreAuthList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Entry State
  const [showLogModal, setShowLogModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name: '', phone: '', purpose: 'Visit', details: '' });
  const [logging, setLogging] = useState(false);

  // Manual Check-In Code State
  const [checkInToken, setCheckInToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  const fetchVisitors = async () => {
    try {
      const res = await securityService.getActiveVisitors();
      setActiveVisitors(res || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load active visitors' });
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await securityService.getPendingRequests();
      setPendingRequests(res || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load guest requests' });
    }
  };

  const fetchPreAuths = async () => {
    try {
      const res = await securityService.getPreAuthVisitors();
      setPreAuthList(res || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load pre-authorized passes' });
    }
  };

  const fetchAll = () => {
    setRefreshing(true);
    if (activeTab === 'visitors') fetchVisitors().then(() => setRefreshing(false));
    else if (activeTab === 'requests') fetchRequests().then(() => setRefreshing(false));
    else if (activeTab === 'preauth') fetchPreAuths().then(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const handleEntry = async () => {
    if (!newVisitor.name || !newVisitor.phone) {
      Toast.show({ type: 'error', text1: 'Name and phone are required' });
      return;
    }
    setLogging(true);
    try {
      await securityService.logEntry(newVisitor);
      Toast.show({ type: 'success', text1: 'Visitor check-in logged!' });
      setShowLogModal(false);
      setNewVisitor({ name: '', phone: '', purpose: 'Visit', details: '' });
      fetchVisitors();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to log entry' });
    } finally {
      setLogging(false);
    }
  };

  const handleExit = async (id) => {
    try {
      await securityService.markExit(id);
      Toast.show({ type: 'success', text1: 'Visitor marked as checked out' });
      fetchVisitors();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to mark checkout' });
    }
  };

  const handleRequestAction = async (id, status) => {
    try {
      await securityService.updateRequestStatus(id, status);
      Toast.show({ type: 'success', text1: `Request ${status.toLowerCase()}!` });
      fetchRequests();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update request' });
    }
  };

  const handlePreAuthCheckIn = async (token) => {
    const tokenToUse = token || checkInToken;
    if (!tokenToUse.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a pass token' });
      return;
    }
    setVerifying(true);
    try {
      const res = await securityService.checkInPreAuthVisitor(tokenToUse.trim());
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Visitor checked in successfully!' });
        setCheckInToken('');
        fetchPreAuths();
        if (activeTab === 'visitors') fetchVisitors();
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: e.response?.data?.message || 'Invalid or already used pass code',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Security Logs"
        subtitle="Visitor log manager"
        right={
          activeTab === 'visitors' && (
            <TouchableOpacity onPress={() => setShowLogModal(true)} style={styles.addBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          )
        }
      />

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('visitors')}
          style={[styles.tabButton, activeTab === 'visitors' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'visitors' && styles.tabTextActive]}>🚪 Visitor Log</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('requests')}
          style={[styles.tabButton, activeTab === 'requests' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>🛌 Guests</Text>
          {pendingRequests.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('preauth')}
          style={[styles.tabButton, activeTab === 'preauth' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'preauth' && styles.tabTextActive]}>🛡️ Pre-Auths</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'visitors' ? (
        <FlatList
          data={activeVisitors}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} tintColor={colors.primary[500]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  <Ionicons name="person-add-outline" size={20} color={colors.primary[600]} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>
                    {item.purpose} • {item.details}
                  </Text>
                  <Text style={styles.time}>
                    In since: {item.entryTime ? new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleExit(item._id)} style={styles.exitBtn}>
                  <Text style={styles.exitBtnText}>Mark Exit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="enter-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No visitors currently inside</Text>
            </View>
          }
        />
      ) : activeTab === 'requests' ? (
        <FlatList
          data={pendingRequests}
          keyExtractor={i => i._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} tintColor={colors.primary[500]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.guestHeader}>
                <View style={styles.guestMeta}>
                  <Ionicons name="bed-outline" size={18} color={colors.primary[600]} />
                  <Text style={styles.name}>Guest: {item.guest_name}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleRequestAction(item._id, 'APPROVED')} style={styles.approveIcon}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRequestAction(item._id, 'REJECTED')} style={styles.rejectIcon}>
                    <Ionicons name="close-circle" size={24} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.guestBody}>
                <Text style={styles.guestText}>Relation: {item.relation}</Text>
                <Text style={styles.guestText}>
                  Dates: {item.fromDate ? new Date(item.fromDate).toLocaleDateString() : '—'} to {item.toDate ? new Date(item.toDate).toLocaleDateString() : '—'}
                </Text>
                <Text style={styles.guestContact}>Tenant Contact: {item.tenant_id?.contact_number || '—'}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bed-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No pending guest requests</Text>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Manual token check-in */}
          <View style={styles.checkInBox}>
            <Text style={styles.checkInLabel}>Verify & Redeem QR Pass</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="e.g. pass_abc123xyz"
                value={checkInToken}
                onChangeText={setCheckInToken}
                style={styles.textInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => handlePreAuthCheckIn(null)}
                disabled={verifying}
                style={styles.verifyBtn}
              >
                <Text style={styles.verifyBtnText}>{verifying ? '...' : 'Verify'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={preAuthList}
            keyExtractor={i => i._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} tintColor={colors.primary[500]} />}
            renderItem={({ item }) => {
              const isPending = item.status === 'PENDING';
              const isCheckedIn = item.status === 'CHECKED_IN';
              return (
                <View style={styles.card}>
                  <View style={styles.preAuthHeader}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Badge label={item.status} type={isCheckedIn ? 'success' : isPending ? 'primary' : 'default'} />
                      </View>
                      <Text style={styles.preAuthSub}>Phone: {item.phone} • Purpose: {item.purpose}</Text>
                    </View>
                    {isPending && (
                      <TouchableOpacity
                        onPress={() => handlePreAuthCheckIn(item.qrCodeToken)}
                        style={styles.instantBtn}
                      >
                        <Text style={styles.instantBtnText}>Check In</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.preAuthBody}>
                    <Text style={styles.preAuthText}>Tenant: {item.tenant_id?.user_id?.name || 'Resident'} (Room {item.tenant_id?.room_id?.number || '—'})</Text>
                    <Text style={styles.preAuthText}>Expected Date: {item.visitDate ? new Date(item.visitDate).toLocaleDateString() : '—'}</Text>
                    <Text style={styles.preAuthToken}>TOKEN: {item.qrCodeToken}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No pre-authorized visitors found</Text>
              </View>
            }
          />
        </View>
      )}

      {/* Log Entry Modal */}
      <Modal visible={showLogModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Visitor Entry</Text>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
            <Input
              label="Visitor Name"
              placeholder="Full name"
              value={newVisitor.name}
              onChangeText={v => setNewVisitor(f => ({ ...f, name: v }))}
              autoCapitalize="words"
            />
            <Input
              label="Phone Number"
              placeholder="10-digit number"
              value={newVisitor.phone}
              onChangeText={v => setNewVisitor(f => ({ ...f, phone: v }))}
              keyboardType="phone-pad"
            />
            <Input
              label="Purpose"
              placeholder="e.g. Delivery, Visit, Maintenance"
              value={newVisitor.purpose}
              onChangeText={v => setNewVisitor(f => ({ ...f, purpose: v }))}
            />
            <Input
              label="Meeting Details (optional)"
              placeholder="Whom to meet / Room details"
              value={newVisitor.details}
              onChangeText={v => setNewVisitor(f => ({ ...f, details: v }))}
            />
            <Button title="Check-In Visitor" onPress={handleEntry} loading={logging} style={{ marginTop: 8 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: colors.primary[600] },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.primary[600] },
  countBadge: { backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 10, color: '#fff', fontWeight: '800' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '750', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  exitBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  exitBtnText: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  guestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  guestMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionRow: { flexDirection: 'row', gap: 8 },
  guestBody: { backgroundColor: colors.background, borderRadius: 10, padding: 10, gap: 4, marginTop: 4 },
  guestText: { fontSize: 12, color: colors.textSecondary },
  guestContact: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  checkInBox: { padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, gap: 8 },
  checkInLabel: { fontSize: 13, fontWeight: '750', color: colors.textPrimary },
  inputRow: { flexDirection: 'row', gap: 10 },
  textInput: { flex: 1, backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.surfaceBorder, padding: 10, fontSize: 13, fontFamily: 'monospace', color: colors.textPrimary },
  verifyBtn: { backgroundColor: colors.primary[600], borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  preAuthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preAuthSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  preAuthBody: { backgroundColor: colors.background, borderRadius: 10, padding: 10, gap: 4, marginTop: 4 },
  preAuthText: { fontSize: 12, color: colors.textSecondary },
  preAuthToken: { fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, marginTop: 2 },
  instantBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0' },
  instantBtnText: { fontSize: 12, color: '#047857', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
});

export default VisitorLogScreen;
