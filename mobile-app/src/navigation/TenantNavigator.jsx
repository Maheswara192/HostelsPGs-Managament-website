import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Tenant Screens
import TenantDashboard from '../screens/tenant/DashboardScreen';
import TenantPayments from '../screens/tenant/PaymentsScreen';
import TenantComplaints from '../screens/tenant/ComplaintsScreen';
import TenantFood from '../screens/tenant/FoodScreen';
import TenantVisitors from '../screens/tenant/VisitorsScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
  'My Room': 'home',
  Payments: 'card',
  Complaints: 'alert-circle',
  'Food & Menu': 'restaurant',
  Visitors: 'shield-checkmark',
};

const TenantNavigator = () => (
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
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons
          name={focused ? iconMap[route.name] : `${iconMap[route.name]}-outline`}
          size={size}
          color={color}
        />
      ),
    })}
  >
    <Tab.Screen name="My Room" component={TenantDashboard} />
    <Tab.Screen name="Payments" component={TenantPayments} />
    <Tab.Screen name="Complaints" component={TenantComplaints} />
    <Tab.Screen name="Food & Menu" component={TenantFood} />
    <Tab.Screen name="Visitors" component={TenantVisitors} />
  </Tab.Navigator>
);

export default TenantNavigator;
