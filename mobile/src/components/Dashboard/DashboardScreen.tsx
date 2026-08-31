import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SIZES } from '../../constants/theme';
import { useCallMonitor } from '../../hooks/useCallMonitor';
import RiskGauge from './RiskGauge';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation }: Props) {
  const { isMonitoring, currentCall } = useCallMonitor();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={{ color: COLORS.text, marginRight: 15 }}>Settings</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VOVERA</Text>
      
      {isMonitoring && (
        <View style={styles.monitoringBanner}>
          <Text style={styles.bannerText}>Monitoring Call: {currentCall}</Text>
        </View>
      )}

      <RiskGauge score={15} />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Calls Scanned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Blocked</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Recent Calls</Text>
      {/* Mock history list */}
      <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => navigation.navigate('Report', { callerId: '+1987654321', analysisData: { score: 85, signals: ["Synthetic Voice"] } })}
      >
        <Text style={styles.historyText}>+1 (987) 654-321</Text>
        <View style={[styles.badge, { backgroundColor: COLORS.danger }]}>
          <Text style={styles.badgeText}>High Risk</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
  },
  monitoringBanner: {
    backgroundColor: COLORS.warning,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  bannerText: {
    color: '#000',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: SIZES.radius,
    flex: 0.48,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textMuted,
    marginTop: 5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
  },
  historyItem: {
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyText: {
    color: COLORS.text,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  }
});
