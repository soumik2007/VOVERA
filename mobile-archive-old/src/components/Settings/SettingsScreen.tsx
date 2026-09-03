import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Language</Text>
        <Text style={styles.settingValue}>English</Text>
      </View>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Auto-delete Audio</Text>
        <Switch value={true} trackColor={{ true: COLORS.primary }} />
      </View>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Share Anonymous Stats</Text>
        <Switch value={false} />
      </View>
      
      <View style={styles.aboutBox}>
        <Text style={styles.aboutText}>VOVERA v2.0.0</Text>
        <Text style={styles.aboutText}>Blockchain: Active</Text>
      </View>
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
    color: COLORS.text,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingText: {
    color: COLORS.text,
    fontSize: 16,
  },
  settingValue: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  aboutBox: {
    marginTop: 40,
    alignItems: 'center',
  },
  aboutText: {
    color: COLORS.textMuted,
    marginBottom: 5,
  }
});
