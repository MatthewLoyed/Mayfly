import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface AddTodoFormProps {
  onSubmit: (text: string, priority: boolean) => void;
  onCancel?: () => void;
}

/**
 * Form component for adding new todos
 */
export function AddTodoForm({ onSubmit, onCancel }: AddTodoFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSubmit = () => {
    const trimmed = text.trim();
    console.log('[AddTodoForm] submit pressed', { textLength: text.length, trimmedLength: trimmed.length, priority });
    if (trimmed) {
      onSubmit(trimmed, priority);
      setText('');
      setPriority(false);
      Keyboard.dismiss();
    }
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
          placeholder="Add a todo..."
          placeholderTextColor={colors.icon}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          multiline
          autoFocus
        />
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.priorityButton,
            priority && {
              backgroundColor: colors.primary,
            },
            !priority && {
              backgroundColor: colors.habitIncomplete,
              borderWidth: 1,
              borderColor: colors.habitStroke,
            },
          ]}
          onPress={() => setPriority(!priority)}
        >
          <ThemedText
            style={styles.priorityButtonText}
            lightColor={priority ? '#FFFFFF' : colors.text}
            darkColor={priority ? '#FFFFFF' : colors.text}
          >
            {priority ? 'Priority ✓' : 'Make Priority'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={!text.trim()}
        >
          <ThemedText style={styles.submitButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Add
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityButtonText: {
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

