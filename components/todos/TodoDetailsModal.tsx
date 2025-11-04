import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { type Todo } from '@/types/todo';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface TodoDetailsModalProps {
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (details: { dueAt: string | null; estimatedMinutes: number | null }) => void | Promise<void>;
}

export function TodoDetailsModal({ visible, todo, onClose, onSave }: TodoDetailsModalProps) {
  const [estimated, setEstimated] = useState<number | null>(todo?.estimatedMinutes ?? null);
  const [dueAt, setDueAt] = useState<string | null>(todo?.dueAt ?? null);

  React.useEffect(() => {
    setEstimated(todo?.estimatedMinutes ?? null);
    setDueAt(todo?.dueAt ?? null);
  }, [todo]);

  const estimateColor = useMemo(() => {
    if (estimated == null) return undefined;
    if (estimated <= 5) return '#2ecc71'; // green (<= 5 minutes)
    if (estimated >= 15 && estimated <= 60) return '#f39c12'; // orange (15-60)
    if (estimated > 60) return '#e74c3c'; // red (> 60)
    return undefined; // 6-14 stays neutral
  }, [estimated]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <ThemedView style={styles.sheet}>
          <ThemedText type="title" style={styles.title}>
            Todo Details
          </ThemedText>

          {todo && (
            <ThemedText style={styles.subtitle}>{todo.text}</ThemedText>
          )}

          {/* Estimated time quick selectors */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Estimated time</ThemedText>
            <View style={styles.choicesRow}>
              {[5, 15, 30, 60, 90].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.choice, estimated === m && styles.choiceSelected]}
                  onPress={() => setEstimated(m)}
                >
                  <ThemedText>{m}m</ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.choice} onPress={() => setEstimated(null)}>
                <ThemedText>None</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.currentRow}>
              <ThemedText>Current:</ThemedText>
              <ThemedText style={[styles.currentValue, estimateColor ? { color: estimateColor } : null]}>
                {estimated != null ? `${estimated} minutes` : 'Not set'}
              </ThemedText>
            </View>
          </View>

          {/* Reminder (simple ISO text for now) */}
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold">Reminder (ISO date/time)</ThemedText>
            <View style={styles.choicesRow}>
              <TouchableOpacity style={styles.choice} onPress={() => setDueAt(new Date().toISOString())}>
                <ThemedText>Now</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.choice} onPress={() => setDueAt(null)}>
                <ThemedText>Clear</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.currentRow}>
              <ThemedText>Current:</ThemedText>
              <ThemedText style={styles.currentValue}>
                {dueAt ?? 'Not set'}
              </ThemedText>
            </View>
          </View>

              <View style={styles.footerRow}>
                <TouchableOpacity style={styles.footerBtn} onPress={onClose}>
                  <ThemedText>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerBtn}
                  onPress={() => onSave({ dueAt, estimatedMinutes: estimated })}
                >
                  <ThemedText>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: Math.round(Dimensions.get('window').height * 0.5),
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 12,
  },
  section: {
    marginTop: 8,
    marginBottom: 12,
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  choiceSelected: {
    borderColor: '#888',
  },
  currentRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  currentValue: {
    fontWeight: '600',
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  footerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});


