import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';
import ConsentGate from '../components/Onboarding/ConsentGate';
import DashboardScreen from '../components/Dashboard/DashboardScreen';
import ReportScreen from '../components/PostCallReport/ReportScreen';
import SettingsScreen from '../components/Settings/SettingsScreen';
import { getData } from '../services/storage';
import { STORAGE_KEYS } from '../constants/storage';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Consent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    const hasConsent = await getData(STORAGE_KEYS.CONSENT_GIVEN);
    if (hasConsent === 'true') {
      setInitialRoute('Dashboard');
    }
    setLoading(false);
  };

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          contentStyle: { backgroundColor: COLORS.background }
        }}
      >
        <Stack.Screen name="Consent" component={ConsentGate} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
