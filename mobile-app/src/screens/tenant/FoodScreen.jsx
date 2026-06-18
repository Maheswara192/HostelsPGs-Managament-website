import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Image, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import messService from '../../services/mess.service';
import ScreenHeader from '../../components/ScreenHeader';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Card from '../../components/Card';
import { colors } from '../../theme/colors';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (date) => date.toISOString().split('T')[0];

const FoodScreen = () => {
  const [activeTab, setActiveTab] = useState('menu'); // menu | vouchers
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [menu, setMenu] = useState({});
  const [vouchers, setVouchers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Voucher purchase state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [mealType, setMealType] = useState('Lunch');
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Voucher QR zoom state
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const startOfWeek = getStartOfWeek(new Date());

  const getWeekDates = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const todayDateStr = formatDate(new Date());

  // Set selected index to today by default
  useEffect(() => {
    const todayIndex = weekDates.findIndex(d => formatDate(d) === todayDateStr);
    if (todayIndex !== -1) {
      setSelectedDayIndex(todayIndex);
    }
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      const res = await messService.getMenu({ startDate, endDate });

      const menuMap = {};
      weekDates.forEach(d => {
        menuMap[formatDate(d)] = { breakfast: '', lunch: '', snacks: '', dinner: '' };
      });

      if (Array.isArray(res)) {
        res.forEach(item => {
          const itemDate = formatDate(new Date(item.date));
          if (menuMap[itemDate]) {
            menuMap[itemDate] = { ...menuMap[itemDate], ...item.meals };
          }
        });
      }
      setMenu(menuMap);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load weekly menu' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await messService.getMyVouchers();
      if (res.success) {
        setVouchers(res.data || []);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load vouchers' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAll = () => {
    if (activeTab === 'menu') {
      fetchMenu();
    } else {
      fetchVouchers();
    }
  };

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const handleMarkAttendance = async (meal, status) => {
    const selectedDateStr = formatDate(weekDates[selectedDayIndex]);
    try {
      await messService.markAttendance(selectedDateStr, meal.toLowerCase(), status);
      Toast.show({
        type: 'success',
        text1: `Marked ${meal} as ${status}!`,
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to log attendance' });
    }
  };

  const getPrice = (type) => {
    switch (type) {
      case 'Breakfast': return 50;
      case 'Lunch': return 80;
      case 'Dinner': return 80;
      case 'Special': return 150;
      default: return 80;
    }
  };

  const handleBuyVoucher = async () => {
    setSubmitting(true);
    try {
      const price = getPrice(mealType);
      const res = await messService.purchaseVoucher({
        mealType,
        price,
        isGuestVoucher: isGuest,
        guestName: isGuest ? guestName : '',
      });
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Meal coupon ordered!', text2: 'Added to next rent bill.' });
        setShowBuyModal(false);
        setMealType('Lunch');
        setIsGuest(false);
        setGuestName('');
        fetchVouchers();
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Purchase failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeDate = weekDates[selectedDayIndex];
  const activeDateStr = formatDate(activeDate);
  const isActiveToday = activeDateStr === todayDateStr;

  const meals = [
    { name: 'Breakfast', icon: 'sunny-outline', time: '7:00 AM – 9:00 AM', color: '#f59e0b' },
    { name: 'Lunch', icon: 'partly-sunny-outline', time: '12:00 PM – 2:00 PM', color: colors.success },
    { name: 'Snacks', icon: 'cafe-outline', time: '4:30 PM – 5:30 PM', color: colors.accent },
    { name: 'Dinner', icon: 'moon-outline', time: '7:00 PM – 9:00 PM', color: colors.primary[600] },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Food & Mess"
        subtitle="Menu & coupons"
        right={
          activeTab === 'vouchers' && (
            <TouchableOpacity onPress={() => setShowBuyModal(true)} style={styles.addBtn}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          )
        }
      />

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('menu')}
          style={[styles.tabButton, activeTab === 'menu' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>🍳 Weekly Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('vouchers')}
          style={[styles.tabButton, activeTab === 'vouchers' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'vouchers' && styles.tabTextActive]}>🎫 Meal Coupons</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'menu' ? (
        <View style={{ flex: 1 }}>
          {/* Week Days Scroller */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayRow}
            contentContainerStyle={styles.dayContent}
          >
            {weekDates.map((date, idx) => {
              const dateStr = formatDate(date);
              const isSelected = selectedDayIndex === idx;
              const isToday = dateStr === todayDateStr;
              return (
                <TouchableOpacity
                  key={dateStr}
                  onPress={() => setSelectedDayIndex(idx)}
                  style={[styles.dayChip, isSelected && styles.dayActive]}
                >
                  <Text style={[styles.dayShort, isSelected && styles.dayShortActive]}>
                    {daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1].slice(0, 3)}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayShortActive]}>{date.getDate()}</Text>
                  {isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: '#fff' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchMenu();
                }}
                tintColor={colors.primary[500]}
              />
            }
          >
            {isActiveToday && (
              <View style={styles.todayBadge}>
                <Ionicons name="time-outline" size={16} color={colors.primary[600]} />
                <Text style={styles.todayText}>Today's Schedule & Attendance</Text>
              </View>
            )}

            {meals.map(meal => {
              const menuItems = menu[activeDateStr]?.[meal.name.toLowerCase()] || 'Not set';
              return (
                <View key={meal.name} style={[styles.mealCard, { borderLeftColor: meal.color, borderLeftWidth: 4 }]}>
                  <View style={styles.mealHeader}>
                    <Ionicons name={meal.icon} size={20} color={meal.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealTime}>{meal.time}</Text>
                    </View>
                  </View>
                  <Text style={styles.mealItems}>{menuItems}</Text>

                  {isActiveToday && menuItems !== 'Not set' && (
                    <View style={styles.attendanceActions}>
                      <TouchableOpacity
                        onPress={() => handleMarkAttendance(meal.name, 'eating')}
                        style={[styles.attBtn, styles.btnEat]}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#047857" />
                        <Text style={styles.btnEatText}>Eating</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMarkAttendance(meal.name, 'skipped')}
                        style={[styles.attBtn, styles.btnSkip]}
                      >
                        <Ionicons name="close-circle" size={16} color="#be123c" />
                        <Text style={styles.btnSkipText}>Skip</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchVouchers();
              }}
              tintColor={colors.primary[500]}
            />
          }
          renderItem={({ item }) => {
            const isUnused = item.status === 'UNUSED';
            const isUsed = item.status === 'USED';
            return (
              <TouchableOpacity onPress={() => setSelectedVoucher(item)} style={styles.voucherCard}>
                <View style={[styles.statusStrip, { backgroundColor: isUnused ? colors.primary[500] : isUsed ? colors.success : colors.textMuted }]} />
                <View style={styles.voucherBody}>
                  <View style={styles.voucherHeader}>
                    <Badge label={item.status} type={isUnused ? 'primary' : isUsed ? 'success' : 'default'} />
                    <Text style={styles.voucherPrice}>₹{item.price}</Text>
                  </View>
                  <Text style={styles.voucherTitle}>🍳 {item.mealType} Coupon</Text>
                  {item.isGuestVoucher && (
                    <Text style={styles.voucherGuest}>Guest: {item.guestName || 'Yes'}</Text>
                  )}
                  <Text style={styles.voucherDate}>Ordered: {new Date(item.purchaseDate).toLocaleDateString()}</Text>

                  <View style={styles.voucherFooter}>
                    <Text style={styles.voucherCode}>{item.voucherCode}</Text>
                    {isUnused && (
                      <Text style={styles.scanText}>
                        <Ionicons name="qr-code-outline" size={12} /> Scan Pass
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="ticket-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No meal coupons ordered</Text>
              <Button title="Purchase First Coupon" onPress={() => setShowBuyModal(true)} style={{ marginTop: 10 }} />
            </View>
          }
        />
      )}

      {/* QR Code Detail Modal */}
      <Modal visible={selectedVoucher !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={() => setSelectedVoucher(null)} style={styles.closeModal}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalHeading}>{selectedVoucher?.mealType} Coupon</Text>
            <Text style={styles.modalSubheading}>Mess Entry Food Pass</Text>

            <View style={styles.qrContainer}>
              {selectedVoucher && (
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedVoucher.voucherCode}` }}
                  style={[styles.qrImage, selectedVoucher.status !== 'UNUSED' && { opacity: 0.2 }]}
                />
              )}
              {selectedVoucher && selectedVoucher.status !== 'UNUSED' && (
                <View style={styles.statusOverlay}>
                  <Text style={styles.overlayText}>{selectedVoucher.status}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalSpecs}>
              <View style={styles.specRow}><Text style={styles.specLabel}>Status</Text><Text style={styles.specValue}>{selectedVoucher?.status}</Text></View>
              <View style={styles.specRow}><Text style={styles.specLabel}>Code</Text><Text style={[styles.specValue, { fontFamily: 'monospace' }]}>{selectedVoucher?.voucherCode}</Text></View>
              <View style={styles.specRow}><Text style={styles.specLabel}>Price</Text><Text style={styles.specValue}>₹{selectedVoucher?.price}</Text></View>
              {selectedVoucher?.isGuestVoucher && (
                <View style={styles.specRow}><Text style={styles.specLabel}>Guest</Text><Text style={styles.specValue}>{selectedVoucher?.guestName}</Text></View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Buy Voucher Modal */}
      <Modal visible={showBuyModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.buyModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Purchase Meal Coupon</Text>
            <TouchableOpacity onPress={() => setShowBuyModal(false)}>
              <Ionicons name="close" size={26} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={styles.label}>Select Meal Category</Text>
            <View style={styles.mealSelector}>
              {['Breakfast', 'Lunch', 'Dinner', 'Special'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setMealType(type)}
                  style={[styles.mealSelectBtn, mealType === type && styles.mealSelectActive]}
                >
                  <Text style={[styles.mealSelectText, mealType === type && styles.mealSelectTextActive]}>{type}</Text>
                  <Text style={[styles.mealSelectPrice, mealType === type && styles.mealSelectTextActive]}>₹{getPrice(type)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>This coupon is for a visiting guest / parent</Text>
              <Switch value={isGuest} onValueChange={setIsGuest} trackColor={{ true: colors.primary[500] }} />
            </View>

            {isGuest && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Guest Name</Text>
                <TextInput
                  placeholder="e.g. John Doe (Father)"
                  value={guestName}
                  onChangeText={setGuestName}
                  style={styles.textInput}
                />
              </View>
            )}

            <View style={styles.priceSummary}>
              <Text style={styles.priceText}>Total Amount Billed: ₹{getPrice(mealType)}</Text>
              <Text style={styles.priceSubtext}>
                No immediate payment required. This amount will be added to your next monthly rent bill.
              </Text>
            </View>

            <Button title="Order & Add to Bill" onPress={handleBuyVoucher} loading={submitting} style={{ marginTop: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: colors.primary[600] },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.primary[600] },
  dayRow: { maxHeight: 75, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  dayContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.surfaceBorder, alignItems: 'center', minWidth: 50 },
  dayActive: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  dayShort: { fontSize: 10, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  dayShortActive: { color: '#fff' },
  dayNum: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 1 },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary[600], marginTop: 3 },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  todayBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary[50], borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primary[200] },
  todayText: { fontSize: 12, fontWeight: '600', color: colors.primary[600] },
  mealCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  mealName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  mealTime: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  mealItems: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 },
  attendanceActions: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 12 },
  attBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  btnEat: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  btnEatText: { fontSize: 13, fontWeight: '600', color: '#047857' },
  btnSkip: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  btnSkipText: { fontSize: 13, fontWeight: '600', color: '#be123c' },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  voucherCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceBorder, flexDirection: 'row', overflow: 'hidden' },
  statusStrip: { width: 6 },
  voucherBody: { flex: 1, padding: 14, gap: 4 },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voucherPrice: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  voucherTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
  voucherGuest: { fontSize: 12, color: colors.primary[600], fontWeight: '600' },
  voucherDate: { fontSize: 11, color: colors.textMuted },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 10, marginTop: 6 },
  voucherCode: { fontSize: 10, fontFamily: 'monospace', color: colors.textMuted, backgroundColor: colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: colors.surfaceBorder },
  scanText: { fontSize: 11, fontWeight: '700', color: colors.primary[600] },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 30 },
  emptyText: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  closeModal: { alignSelf: 'flex-end', padding: 4 },
  modalHeading: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  modalSubheading: { fontSize: 12, color: colors.textMuted, marginBottom: 20 },
  qrContainer: { padding: 14, backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.surfaceBorder, position: 'relative', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  qrImage: { width: 170, height: 170 },
  statusOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  overlayText: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  modalSpecs: { width: '100%', backgroundColor: colors.background, borderRadius: 14, padding: 14, gap: 8, marginTop: 20, borderWidth: 1, borderColor: colors.surfaceBorder },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  specLabel: { fontSize: 12, color: colors.textMuted },
  specValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  buyModal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  label: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  mealSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  mealSelectBtn: { width: '47%', backgroundColor: colors.surface, padding: 14, borderRadius: 14, borderWidth: 2, borderColor: colors.surfaceBorder, alignItems: 'center', gap: 4 },
  mealSelectActive: { borderColor: colors.primary[600], backgroundColor: colors.primary[50] },
  mealSelectText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  mealSelectTextActive: { color: colors.primary[700], fontWeight: '800' },
  mealSelectPrice: { fontSize: 12, color: colors.textMuted },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  switchLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, flex: 1, marginRight: 10 },
  textInput: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.surfaceBorder, padding: 12, fontSize: 14, color: colors.textPrimary },
  priceSummary: { padding: 14, backgroundColor: '#e0f2fe', borderRadius: 14, borderWidth: 1, borderColor: '#bae6fd', marginTop: 20, gap: 6 },
  priceText: { fontSize: 14, fontWeight: '750', color: '#0369a1' },
  priceSubtext: { fontSize: 11, color: '#0284c7', lineHeight: 16 },
});

export default FoodScreen;
