import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { COLORS, SIZES } from '../../constants/theme';
import { saveData } from '../../services/storage';
import { STORAGE_KEYS } from '../../constants/storage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Consent'>;
};

export default function ConsentGate({ navigation }: Props) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    await saveData(STORAGE_KEYS.CONSENT_GIVEN, 'true');
    navigation.replace('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to VOVERA</Text>
      <ScrollView 
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.text}>
          To protect you from AI voice scams, VOVERA needs your consent to monitor calls from unknown numbers.{"\n\n"}
          1. We only monitor calls from numbers NOT in your contacts.{"\n"}
          2. We record a short snippet of the audio to analyze for deepfakes.{"\n"}
          3. Raw audio is DELETED immediately after analysis.{"\n"}
          4. We never sell your data.
          {"\n\n"}Please scroll to the bottom to accept.
          {"\n\n"}
          [More Terms...]{"\n\n"}
          [More Terms...]{"\n\n"}
          [More Terms...]{"\n\n"}
          [More Terms...]{"\n\n"}
        </Text>
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.button, !scrolledToBottom && styles.buttonDisabled]} 
        disabled={!scrolledToBottom}
        onPress={handleAccept}
      >
        <Text style={styles.buttonText}>I Accept</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.paddingLarge,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    marginTop: 40,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
