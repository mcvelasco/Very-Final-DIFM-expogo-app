// components/MicButton.tsx
import React, { useState } from 'react';
import {
  TouchableOpacity,
  Alert,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { transcribeAudio } from '@/services/transcriptions';

interface MicButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function MicButton({ onTranscription, disabled }: MicButtonProps) {
  const { startRecording, stopRecording, isRecording } = useAudioRecorder();
  const [transcribing, setTranscribing] = useState(false);

  const handlePress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (!uri) return;
      try {
        setTranscribing(true);
        const text = await transcribeAudio(uri);
        onTranscription(text);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not transcribe audio.';
        Alert.alert('Transcription Failed', message);
      } finally {
        setTranscribing(false);
      }
    } else {
      await startRecording();
    }
  };

  const isDisabled = disabled || transcribing;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          isDisabled && styles.buttonDisabled,
        ]}
        activeOpacity={0.8}
      >
        {transcribing ? (
          <ActivityIndicator color="#FFFFFF" size="large" />
        ) : (
          <MaterialIcons
            name={isRecording ? 'stop' : 'mic'}
            size={40}
            color="#FFFFFF"
          />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>
        {transcribing
          ? 'Transcribing…'
          : isRecording
          ? 'Tap to stop'
          : 'Tap to record'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  buttonRecording: {
    backgroundColor: '#EF4444',
    borderColor: '#FCA5A5',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
});