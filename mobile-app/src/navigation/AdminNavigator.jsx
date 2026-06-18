import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import AdminDashboard from '../screens/admin/DashboardScreen';
import PGManagementScreen from '../screens/admin/PGManagementScreen';
import AuditLogsScreen from '../screens/admin/AuditLogsScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.surfaceBorder,
        height: 68,
        paddingBottom: 10,
        paddingTop: 6,
      },
      tabBarActiveTintColor: colors.primary[600],
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, size }) => {
        const icons = { Overview: 'grid', 'All PGs': 'business', 'Audit Logs': 'document-text' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Overview" component={AdminDashboard} />
    <Tab.Screen name="All PGs" component={PGManagementScreen} />
    <Tab.Screen name="Audit Logs" component={AuditLogsScreen} />
  </Tab.Navigator>
);

export default AdminNavigator;
