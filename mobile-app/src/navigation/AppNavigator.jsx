import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import PublicNavigator from './PublicNavigator';
import OwnerNavigator from './OwnerNavigator';
import TenantNavigator from './TenantNavigator';
import AdminNavigator from './AdminNavigator';
import SplashScreen from '../components/SplashScreen';

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  const getRoleNavigator = () => {
    if (!user) return <PublicNavigator />;
    switch (user.role) {
      case 'admin': return <AdminNavigator />;
      case 'owner': return <OwnerNavigator />;
      case 'tenant': return <TenantNavigator />;
      default: return <PublicNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getRoleNavigator()}
    </NavigationContainer>
  );
};

export default AppNavigator;
