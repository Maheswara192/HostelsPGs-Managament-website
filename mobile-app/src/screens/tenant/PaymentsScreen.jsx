import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import tenantService from '../../services/tenant.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

const TenantPayments = () => {
  const [payments, setPayments] = useState([]);
  const [rentAmount, setRentAmount] = useState(0);
  const [messDues, setMessDues] = useState(0);
  const [activeVouchersCount, setActiveVouchersCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);

  const fetch = async () => {
    try {
      const r = await tenantService.getPayments();
      if (r.success) {
        setRentAmount(r.data.rentAmount || 0);
        setMessDues(r.data.messDues || 0);
        setActiveVouchersCount(r.data.activeVouchersCount || 0);
        setPayments(r.data.payments || []);
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Failed to fetch payments' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handlePayRent = () => {
    Alert.alert('Pay Invoice', 'Do you want to initiate payment for your pending dues?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Pay Now',
        onPress: async () => {
          setPaying(true);
          try {
            const res = await tenantService.initiateRentPayment();
            if (res.success) {
              if (res.key_id.startsWith('mock_') || res.key_id === 'rzp_test_missing') {
                Alert.alert(
                  'Simulation Mode',
                  'DEV MODE: Would you like to simulate a successful payment?',
                  [
                    { text: 'Cancel', onPress: () => setPaying(false), style: 'cancel' },
                    {
                      text: 'Simulate Success',
                      onPress: async () => {
                        try {
                          const verifyRes = await tenantService.verifyPayment({
                            razorpay_order_id: res.order_id,
                            razorpay_payment_id: 'pay_mock_' + Date.now(),
                            razorpay_signature: 'mock_signature'
                          });
                          if (verifyRes.success) {
                            Toast.show({ type: 'success', text1: 'Payment successful!' });
                            fetch();
                          } else {
                            Toast.show({ type: 'error', text1: 'Payment verification failed' });
                          }
                        } catch (err) {
                          Toast.show({ type: 'error', text1: 'Payment verification error' });
                        } finally {
                          setPaying(false);
                        }
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Online Payment',
                  'Razorpay gateway is active. Please complete checkout on the web portal or configure mock mode on the backend for development testing.',
                  [{ text: 'OK', onPress: () => setPaying(false) }]
                );
              }
            } else {
              Toast.show({ type: 'error', text1: 'Failed to initiate payment' });
              setPaying(false);
            }
          } catch (e) {
            Toast.show({ type: 'error', text1: e.response?.data?.message || 'Payment failed' });
            setPaying(false);
          }
        }
      }
    ]);
  };

  const statusType = (s) => ({ SUCCESS: 'success', CREATED: 'warning', FAILED: 'danger' }[s] || 'default');

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: item.status === 'SUCCESS' ? '#ecfdf5' : '#fffbeb' }]}>
          <Ionicons name="card-outline" size={20} color={item.status === 'SUCCESS' ? colors.success : colors.warning} />
        </View>
        <View style={styles.info}>
          <Text style={styles.month}>{item.type === 'RENT' ? 'Room Rent' : item.type || 'Payment'}</Text>
          <Text style={styles.date}>
            {item.transaction_date ? `Paid: ${new Date(item.transaction_date).toLocaleDateString()}` : '—'}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>₹{item.amount}</Text>
          <Badge label={item.status || 'CREATED'} type={statusType(item.status)} />
        </View>
      </View>
    </View>
  );

  const pending = rentAmount + messDues;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Payments" subtitle="Dues & Receipts" />
      {pending > 0 && (
        <View style={styles.pendingBanner}>
          <View style={styles.bannerInfo}>
            <Ionicons name="warning-outline" size={22} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Pending Balance: ₹{pending}</Text>
              <Text style={styles.bannerSub}>
                Rent: ₹{rentAmount} {messDues > 0 ? `+ Mess: ₹${messDues} (${activeVouchersCount} coupons)` : ''}
              </Text>
            </View>
          </View>
          <Button title="Pay Dues Now" onPress={handlePayRent} loading={paying} style={styles.payBtn} />
        </View>
      )}
      <FlatList
        data={payments}
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
            <Ionicons name="card-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No payment history</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  pendingBanner: {
    margin: 16,
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  bannerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  bannerSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  payBtn: { backgroundColor: colors.primary[600] },
  list: { padding: 16, gap: 10, paddingBottom: 30 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  month: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});

export default TenantPayments;
