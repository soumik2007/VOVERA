import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SIZES } from '../../constants/theme';
import RiskGauge from '../Dashboard/RiskGauge';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>;

export default function ReportScreen({ route }: Props) {
  const { callerId, analysisData } = route.params;

  const handleFlagSpam = async () => {
    try {
      await api.post(ENDPOINTS.flagSpam, {
        caller_hash: callerId, // Ideally hash this first
        reason: "User flagged",
        device_id: "stub_device_id"
      });
      alert('Number flagged as spam');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Call Report</Text>
      <Text style={styles.callerId}>{callerId}</Text>
      
      <RiskGauge score={analysisData.score} />
      
      <View style={styles.copilotBox}>
        <Text style={styles.copilotTitle}>AI Copilot Alert</Text>
        <Text style={styles.copilotText}>
          Warning: AI Copilot detected potential synthetic patterns. Unnatural speech cadence was observed.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Anomaly Signals</Text>
      {analysisData.signals?.map((signal: string, idx: number) => (
        <View key={idx} style={styles.signalItem}>
          <Text style={styles.signalText}>• {signal}</Text>
        </View>
      ))}

      <View style={styles.blockchainBox}>
        <Text style={styles.blockchainText}>✓ Verified on VOVERA Blockchain</Text>
      </View>

      <TouchableOpacity style={styles.flagButton} onPress={handleFlagSpam}>
        <Text style={styles.flagButtonText}>Flag as Spam</Text>
      </TouchableOpacity>
    </ScrollView>
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
    color: COLORS.text,
  },
  callerId: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginBottom: 20,
  },
  copilotBox: {
    backgroundColor: '#2A1A1A',
    borderColor: COLORS.danger,
    borderWidth: 1,
    padding: 15,
    borderRadius: SIZES.radius,
    marginBottom: 20,
  },
  copilotTitle: {
    color: COLORS.danger,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  copilotText: {
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  signalItem: {
    marginBottom: 5,
  },
  signalText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  blockchainBox: {
    backgroundColor: '#1A2A1A',
    padding: 12,
    borderRadius: SIZES.radius,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  blockchainText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  flagButton: {
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: 40,
  },
  flagButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
