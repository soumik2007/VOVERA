import { useEffect, useState } from 'react';
import { isContact } from '../services/contacts';
import { startRecording, stopRecording } from '../services/audioBuffer';
import api from '../services/api';
import { ENDPOINTS } from '../constants/api';

export const useCallMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentCall, setCurrentCall] = useState<string | null>(null);

  // Stub for native call monitoring hook
  useEffect(() => {
    // In a real app, you would use a native module like react-native-callkeep
    // or react-native-incall-manager to detect incoming calls
    const simulateIncomingCall = async () => {
      const dummyNumber = "+1234567890";
      const contactExists = await isContact(dummyNumber);
      
      if (!contactExists) {
        setCurrentCall(dummyNumber);
        await startRecording();
        setIsMonitoring(true);
        
        // Simulate call end after 5 seconds
        setTimeout(async () => {
          const audioUri = await stopRecording();
          setIsMonitoring(false);
          setCurrentCall(null);
          
          if (audioUri) {
            analyzeCall(dummyNumber, audioUri);
          }
        }, 5000);
      }
    };
    
    // Uncomment to simulate call
    // setTimeout(simulateIncomingCall, 3000);
  }, []);

  const analyzeCall = async (callerId: string, audioUri: string) => {
    try {
      const formData = new FormData();
      formData.append('caller_id', callerId);
      // Simulate file upload
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'recording.wav'
      } as any);

      const response = await api.post(ENDPOINTS.analyze, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Analysis complete', response.data);
      // Trigger navigation or state update here
    } catch (error) {
      console.error('Analysis failed', error);
    }
  };

  return { isMonitoring, currentCall };
};
