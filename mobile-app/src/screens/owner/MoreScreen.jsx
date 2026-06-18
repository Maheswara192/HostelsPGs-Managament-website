import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const menuItems = [
  { label: 'Complaints', icon: 'alert-circle-outline', route: 'Complaints', color: colors.danger, bg: '#fee2e2' },
  { label: 'Notices', icon: 'megaphone-outline', route: 'Notices', color: colors.warning, bg: '#fef3c7' },
  { label: 'Expenses', icon: 'trending-up-outline', route: 'Expenses', color: colors.info, bg: '#dbeafe' },
  { label: 'Mess Menu', icon: 'restaurant-outline', route: 'MessManagement', color: '#f97316', bg: '#ffedd5' },
  { label: 'Visitor Log', icon: 'shield-checkmark-outline', route: 'VisitorLog', color: '#8b5cf6', bg: '#ede9fe' },
  { label: 'Visit Requests', icon: 'people-outline', route: 'VisitRequests', color: '#06b6d4', bg: '#cffafe' },
  { label: 'Housekeeping', icon: 'home-outline', route: 'Housekeeping', color: '#10b981', bg: '#ecfdf5' },
  { label: 'Inventory', icon: 'cube-outline', route: 'Inventory', color: '#6366f1', bg: '#e0e7ff' },
];

const MoreScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="More" subtitle="All features" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'O'}</Text></View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Owner'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            <Text style={styles.userRole}>PG Owner</Text>
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.route} style={styles.menuItem} onPress={() => navigation.navigate(item.route)} activeOpacity={0.8}>
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.arrow} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },

  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.surfaceBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary[600], alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userInfo: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  userEmail: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  userRole: { fontSize: 12, color: colors.primary[600], fontWeight: '600', marginTop: 4 },

  grid: { gap: 10, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.surfaceBorder },
  menuIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  arrow: { marginLeft: 4 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', borderRadius: 16, padding: 16, gap: 10 },
  logoutText: { fontSize: 16, fontWeight: '700', color: colors.danger },
});

export default MoreScreen;
