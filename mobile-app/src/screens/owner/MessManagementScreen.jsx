import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import messService from '../../services/mess.service';
import ScreenHeader from '../../components/ScreenHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
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

const MessManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('menu'); // menu | analytics | vouchers
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Weekly Menu Planner State
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  
  // Single day's editing states
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [snacks, setSnacks] = useState('');
  const [dinner, setDinner] = useState('');

  // Forecast analytics state
  const [analytics, setAnalytics] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Vouchers state
  const [vouchers, setVouchers] = useState([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const getWeekDates = () => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const activeDate = weekDates[selectedDayIdx];

  const fetchMenu = async () => {
    try {
      const startDate = formatDate(weekDates[0]);
      const endDate = formatDate(weekDates[6]);
      const data = await messService.getMenu({ startDate, endDate });

      const menuMap = {};
      weekDates.forEach(d => {
        menuMap[formatDate(d)] = { breakfast: '', lunch: '', snacks: '', dinner: '' };
      });

      if (Array.isArray(data)) {
        data.forEach(item => {
          const itemDate = formatDate(new Date(item.date));
          if (menuMap[itemDate]) {
            menuMap[itemDate] = { ...menuMap[itemDate], ...item.meals };
          }
        });
      }
      setWeeklyMenu(menuMap);
      
      // Update form fields for the currently selected day
      const activeDateStr = formatDate(weekDates[selectedDayIdx]);
      const activeMeals = menuMap[activeDateStr] || {};
      setBreakfast(activeMeals.breakfast || '');
      setLunch(activeMeals.lunch || '');
      setSnacks(activeMeals.snacks || '');
      setDinner(activeMeals.dinner || '');
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load menu' });
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const todayStr = formatDate(new Date());
      const res = await messService.getAnalytics(todayStr);
      if (res && res.stats) {
        setAnalytics(res.stats);
      }
    } catch {
      console.warn('Analytics load error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchVouchers = async () => {
    try {
      const res = await messService.getVouchersList();
      setVouchers(res || []);
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to load vouchers list' });
    }
  };

  const fetchTab = () => {
    if (activeTab === 'menu') fetchMenu().then(() => setRefreshing(false));
    else if (activeTab === 'analytics') fetchAnalytics().then(() => setRefreshing(false));
    else if (activeTab === 'vouchers') fetchVouchers().then(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchTab();
  }, [activeTab, currentWeekStart]);

  // If selected day index changes, update inputs from weeklyMenu map
  useEffect(() => {
    const activeDateStr = formatDate(weekDates[selectedDayIdx]);
    const activeMeals = weeklyMenu[activeDateStr] || {};
    setBreakfast(activeMeals.breakfast || '');
    setLunch(activeMeals.lunch || '');
    setSnacks(activeMeals.snacks || '');
    setDinner(activeMeals.dinner || '');
  }, [selectedDayIdx, weeklyMenu]);

  const handleSaveMenu = async () => {
    setSaving(true);
    const activeDateStr = formatDate(weekDates[selectedDayIdx]);
    const mealsData = {
      breakfast: breakfast.trim(),
      lunch: lunch.trim(),
      snacks: snacks.trim(),
      dinner: dinner.trim(),
    };
    try {
      await messService.updateMenu(activeDateStr, mealsData);
      Toast.show({ type: 'success', text1: 'Menu saved successfully!' });
      
      // Update local state map
      setWeeklyMenu(prev => ({
        ...prev,
        [activeDateStr]: mealsData
      }));
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save menu changes' });
    } finally {
      setSaving(false);
    }
  };

  const navigateWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart);
  };

  const handleVerifyVoucher = async (code = null) => {
    const codeToVerify = code || verifyCode;
    if (!codeToVerify.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter a coupon code' });
      return;
    }
    setVerifying(true);
    try {
      const res = await messService.verifyVoucher(codeToVerify.trim());
      if (res.success) {
        Toast.show({ type: 'success', text1: 'Voucher redeemed successfully!' });
        setVerifyCode('');
        fetchVouchers();
      }
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Redemption Failed',
        text2: e.response?.data?.message || 'Invalid or already used voucher',
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Mess Manager" subtitle="Planner & redemptions" />

      {/* Navigation tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('menu')}
          style={[styles.tabButton, activeTab === 'menu' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>🍳 Menu Planner</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('analytics')}
          style={[styles.tabButton, activeTab === 'analytics' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>📊 Forecasts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('vouchers')}
          style={[styles.tabButton, activeTab === 'vouchers' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'vouchers' && styles.tabTextActive]}>🎫 Vouchers</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'menu' ? (
        <View style={{ flex: 1 }}>
          {/* Week navigator header */}
          <View style={styles.weekNav}>
            <TouchableOpacity onPress={() => navigateWeek(-1)} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>
              Week: {weekDates[0].toLocaleDateString([], { month: 'short', day: 'numeric' })} – {weekDates[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={() => navigateWeek(1)} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Days picker */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dayScroller}
            contentContainerStyle={styles.dayContent}
          >
            {weekDates.map((d, idx) => {
              const isSelected = selectedDayIdx === idx;
              const isToday = formatDate(d) === formatDate(new Date());
              return (
                <TouchableOpacity
                  key={d.toString()}
                  onPress={() => setSelectedDayIdx(idx)}
                  style={[styles.dayChip, isSelected && styles.dayActive]}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1].slice(0, 3)}</Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>{d.getDate()}</Text>
                  {isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: '#fff' }]} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Meal Editor */}
          <ScrollView style={styles.editorContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.editorHeader}>
              Meals for {daysOfWeek[activeDate?.getDay() === 0 ? 6 : activeDate?.getDay() - 1]}, {activeDate?.toLocaleDateString([], { month: 'long', day: 'numeric' })}
            </Text>
            
            <View style={styles.inputCard}>
              <Input label="Breakfast Menu" placeholder="e.g. Idli, Dosa, Tea" value={breakfast} onChangeText={setBreakfast} />
              <Input label="Lunch Menu" placeholder="e.g. Rice, Dal, Veg Fry, Curd" value={lunch} onChangeText={setLunch} />
              <Input label="Snacks Menu" placeholder="e.g. Samosa, Chai" value={snacks} onChangeText={setSnacks} />
              <Input label="Dinner Menu" placeholder="e.g. Roti, Paneer Masala, Milk" value={dinner} onChangeText={setDinner} />

              <Button title="Save Menu Changes" onPress={handleSaveMenu} loading={saving} style={{ marginTop: 10 }} />
            </View>
          </ScrollView>
        </View>
      ) : activeTab === 'analytics' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAnalytics().then(() => setRefreshing(false));
              }}
              tintColor={colors.primary[500]}
            />
          }
        >
          <Text style={styles.analyticsTitle}>Today's Food Consumption Forecast</Text>
          <Text style={styles.analyticsSubtitle}>Cooking estimates based on resident attendance logs</Text>
          
          {loadingAnalytics ? (
            <View style={styles.centered}><Text style={{ color: colors.textMuted }}>Loading forecasts...</Text></View>
          ) : analytics.length === 0 ? (
            <View style={styles.centered}><Text style={{ color: colors.textMuted }}>No forecast data available for today</Text></View>
          ) : (
            <View style={styles.analyticsGrid}>
              {analytics.map(item => (
                <View key={item.meal} style={styles.analCard}>
                  <View style={styles.analHeader}>
                    <Text style={styles.analMeal}>{item.meal}</Text>
                    <Badge label={`Total: ${item.total}`} type="primary" />
                  </View>
                  <View style={styles.analStats}>
                    <View style={styles.analStatItem}>
                      <Text style={styles.analValCook}>{item.eating}</Text>
                      <Text style={styles.analLabel}>Cook Meals</Text>
                    </View>
                    <View style={styles.analStatItem}>
                      <Text style={styles.analValSkip}>{item.skipped}</Text>
                      <Text style={styles.analLabel}>Skipped</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Verify coupon */}
          <View style={styles.verifyBox}>
            <Text style={styles.verifyLabel}>Redeem Meal Coupon Pass</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="e.g. meal_coup_abc123xyz"
                value={verifyCode}
                onChangeText={setVerifyCode}
                style={styles.textInput}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => handleVerifyVoucher()}
                disabled={verifying}
                style={styles.redeemBtn}
              >
                <Text style={styles.redeemBtnText}>{verifying ? '...' : 'Verify'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={vouchers}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAll} tintColor={colors.primary[500]} />}
            renderItem={({ item }) => {
              const tenantName = item.tenant_id?.user_id?.name || 'Resident';
              const roomNo = item.tenant_id?.room_id?.number || '—';
              const isUnused = item.status === 'UNUSED';
              const isUsed = item.status === 'USED';
              return (
                <View style={styles.card}>
                  <View style={styles.voucherHeader}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.name}>{item.mealType} Coupon</Text>
                        <Badge label={item.status} type={isUsed ? 'success' : isUnused ? 'primary' : 'default'} />
                      </View>
                      <Text style={styles.voucherSub}>Tenant: {tenantName} (Room {roomNo})</Text>
                      {item.isGuestVoucher && (
                        <Text style={styles.guestTag}>Guest Pass: {item.guestName || 'Yes'}</Text>
                      )}
                    </View>
                    {isUnused ? (
                      <TouchableOpacity
                        onPress={() => handleVerifyVoucher(item.voucherCode)}
                        style={styles.instantRedeemBtn}
                      >
                        <Text style={styles.instantRedeemText}>Redeem</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.priceTag}>₹{item.price}</Text>
                    )}
                  </View>
                  <View style={styles.voucherFooter}>
                    <Text style={styles.footerText}>Ordered: {new Date(item.purchaseDate).toLocaleDateString()}</Text>
                    {item.useDate && (
                      <Text style={styles.footerText}>Used: {new Date(item.useDate).toLocaleDateString()}</Text>
                    )}
                    <Text style={styles.tokenText}>CODE: {item.voucherCode}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="ticket-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>No meal coupons billed yet</Text>
              </View>
            }
          />
        </View>
      )}
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
  weekNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder },
  navBtn: { padding: 6, backgroundColor: colors.background, borderRadius: 8 },
  weekLabel: { fontSize: 13, fontWeight: '750', color: colors.textPrimary },
  dayScroller: { maxHeight: 75, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, backgroundColor: colors.surface },
  dayContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.surfaceBorder, alignItems: 'center', minWidth: 50 },
  dayActive: { backgroundColor: colors.primary[600], borderColor: colors.primary[600] },
  dayText: { fontSize: 10, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  dayTextActive: { color: '#fff' },
  dayNum: { fontSize: 14, fontWeight: '800', color: colors.textPrimary, marginTop: 1 },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary[600], marginTop: 3 },
  editorContent: { padding: 16 },
  editorHeader: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  inputCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder, gap: 12, marginBottom: 30 },
  scrollContainer: { padding: 16, paddingBottom: 40 },
  analyticsTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  analyticsSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 16 },
  analyticsGrid: { gap: 14 },
  analCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.surfaceBorder, gap: 12 },
  analHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  analMeal: { fontSize: 16, fontWeight: '750', color: colors.textPrimary, textTransform: 'capitalize' },
  analStats: { flexDirection: 'row', gap: 16 },
  analStatItem: { flex: 1, backgroundColor: colors.background, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.surfaceBorder },
  analValCook: { fontSize: 20, fontWeight: '800', color: colors.success },
  analValSkip: { fontSize: 20, fontWeight: '800', color: colors.danger },
  analLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  verifyBox: { padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.surfaceBorder, gap: 8 },
  verifyLabel: { fontSize: 13, fontWeight: '750', color: colors.textPrimary },
  inputRow: { flexDirection: 'row', gap: 10 },
  textInput: { flex: 1, backgroundColor: colors.background, borderRadius: 10, borderWidth: 1, borderColor: colors.surfaceBorder, padding: 10, fontSize: 13, fontFamily: 'monospace', color: colors.textPrimary },
  redeemBtn: { backgroundColor: colors.primary[600], borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  redeemBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder, gap: 8 },
  voucherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 14, fontWeight: '750', color: colors.textPrimary },
  voucherSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  guestTag: { fontSize: 11, color: colors.primary[600], fontWeight: '700', marginTop: 2 },
  priceTag: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  instantRedeemBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0' },
  instantRedeemText: { fontSize: 12, color: '#047857', fontWeight: '700' },
  voucherFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.surfaceBorder, paddingTop: 8, marginTop: 4 },
  footerText: { fontSize: 10, color: colors.textMuted },
  tokenText: { fontSize: 10, fontFamily: 'monospace', color: colors.textMuted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  centered: { paddingVertical: 60, alignItems: 'center' },
});

export default MessManagementScreen;
