import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface AddHabitFormProps {
  onSubmit: (name: string, icon?: string) => void;
  onCancel?: () => void;
}

/**
 * Simple form to add a new habit by name
 */
export function AddHabitForm({ onSubmit, onCancel }: AddHabitFormProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | undefined>(undefined);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed, icon);
    setName('');
    setIcon(undefined);
    Keyboard.dismiss();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.backgroundSubtle,
              borderColor: colors.habitStroke,
            },
          ]}
          placeholder="Add a habit name..."
          placeholderTextColor={colors.icon}
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleSubmit}
          autoFocus
        />
      </View>

      {/* Quick icon choices */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <ThemedText style={{ fontWeight: '600' }}>Icon:</ThemedText>
        {['fitness', 'book', 'medkit', 'water', 'leaf', 'alarm'].map((k) => (
          <TouchableOpacity key={k} onPress={() => setIcon(`ios-${k}`)}
            style={{
              paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12,
              borderWidth: 1, borderColor: colors.habitStroke,
              backgroundColor: icon === `ios-${k}` ? colors.backgroundSubtle : 'transparent',
            }}
          >
            <ThemedText>{k}</ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={() => setIcon(undefined)}
          style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.habitStroke }}>
          <ThemedText>None</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.habitStroke }]}
            onPress={onCancel}
          >
            <ThemedText style={styles.cancelButtonText} lightColor={colors.text} darkColor={colors.text}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={name.trim().length === 0}
        >
          <ThemedText style={styles.submitButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Add Habit
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});


