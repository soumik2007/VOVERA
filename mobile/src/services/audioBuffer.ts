import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

export const startRecording = async () => {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
    console.log('Recording started');
  } catch (err) {
    console.error('Failed to start recording', err);
  }
};

export const stopRecording = async (): Promise<string | null> => {
  if (!recording) return null;
  
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recording = null;
    return uri;
  } catch (error) {
    console.error('Failed to stop recording', error);
    return null;
  }
};
