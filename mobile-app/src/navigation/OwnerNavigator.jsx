import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Owner Screens
import OwnerDashboard from '../screens/owner/DashboardScreen';
import RoomsScreen from '../screens/owner/RoomsScreen';
import TenantsScreen from '../screens/owner/TenantsScreen';
import PaymentsScreen from '../screens/owner/PaymentsScreen';
import ComplaintsScreen from '../screens/owner/ComplaintsScreen';
import NoticesScreen from '../screens/owner/NoticesScreen';
import ExpensesScreen from '../screens/owner/ExpensesScreen';
import MessManagementScreen from '../screens/owner/MessManagementScreen';
import VisitorLogScreen from '../screens/owner/VisitorLogScreen';
import VisitRequestsScreen from '../screens/owner/VisitRequestsScreen';
import HousekeepingScreen from '../screens/owner/HousekeepingScreen';
import InventoryScreen from '../screens/owner/InventoryScreen';
import MoreScreen from '../screens/owner/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// "More" stack wraps the secondary screens accessible from the More tab
const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MoreHome" component={MoreScreen} />
    <Stack.Screen name="Complaints" component={ComplaintsScreen} />
    <Stack.Screen name="Notices" component={NoticesScreen} />
    <Stack.Screen name="Expenses" component={ExpensesScreen} />
    <Stack.Screen name="MessManagement" component={MessManagementScreen} />
    <Stack.Screen name="VisitorLog" component={VisitorLogScreen} />
    <Stack.Screen name="VisitRequests" component={VisitRequestsScreen} />
    <Stack.Screen name="Housekeeping" component={HousekeepingScreen} />
    <Stack.Screen name="Inventory" component={InventoryScreen} />
  </Stack.Navigator>
);

const tabBarIconMap = {
  Dashboard: 'grid',
  Rooms: 'bed',
  Tenants: 'people',
  Payments: 'card',
  More: 'menu',
};

const OwnerNavigator = () => (
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
          name={focused ? tabBarIconMap[route.name] : `${tabBarIconMap[route.name]}-outline`}
          size={size}
          color={color}
        />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={OwnerDashboard} />
    <Tab.Screen name="Rooms" component={RoomsScreen} />
    <Tab.Screen name="Tenants" component={TenantsScreen} />
    <Tab.Screen name="Payments" component={PaymentsScreen} />
    <Tab.Screen name="More" component={MoreStack} />
  </Tab.Navigator>
);

export default OwnerNavigator;
