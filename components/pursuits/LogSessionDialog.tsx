import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  TextInput, 
  Modal, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface LogSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (session: { duration: number; note?: string }) => void;
  pursuitColor: string;
}

const quickDurations = [15, 30, 45, 60, 90, 120];

export function LogSessionDialog({
  isOpen,
  onClose,
  onLog,
  pursuitColor,
}: LogSessionDialogProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onLog({
      duration,
      note: note.trim() || undefined,
    });
    setDuration(30);
    setNote("");
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
            style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.4)' }]} 
          />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View 
            entering={SlideInDown.springify().damping(20)}
            exiting={SlideOutDown}
            style={[styles.sheet, { backgroundColor: theme.cardBackground }]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Log Your Progress</Text>
              <Pressable 
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.backgroundSubtle }]}
              >
                <X size={20} color={theme.icon} />
              </Pressable>
            </View>

            <ScrollView bounces={false} style={styles.content}>
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>How long did you practice?</Text>
                <View style={styles.durationGrid}>
                  {quickDurations.map((mins) => {
                    const isSelected = duration === mins;
                    return (
                      <Pressable
                        key={mins}
                        onPress={() => {
                          setDuration(mins);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.durationItem,
                          { 
                            backgroundColor: isSelected ? `${pursuitColor}99` : `${pursuitColor}22`,
                            borderColor: isSelected ? pursuitColor : 'transparent',
                          }
                        ]}
                      >
                        <Text style={[styles.durationText, { color: theme.text }]}>{mins} min</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.customDurationRow}>
                    <TextInput
                        value={duration.toString()}
                        onChangeText={(t) => setDuration(parseInt(t) || 0)}
                        keyboardType="numeric"
                        style={[styles.customInput, { borderColor: theme.habitStroke + '33', color: theme.text }]}
                    />
                    <Text style={[styles.customLabel, { color: theme.textSecondary }]}>minutes</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Add a note (optional)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="What did you work on?"
                  placeholderTextColor={theme.icon}
                  multiline
                  numberOfLines={3}
                  style={[styles.textArea, { borderColor: theme.habitStroke + '33', color: theme.text }]}
                />
              </View>

              <Pressable
                onPress={() => {
                    handleSubmit();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                disabled={!duration || duration <= 0}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: pursuitColor },
                  (!duration || duration <= 0) && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed
                ]}
              >
                <Text style={[styles.submitButtonText, { color: theme.background }]}>Log Session</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  durationItem: {
    width: '31%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  customDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827',
  },
  customLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  textArea: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
