import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticType, TactileButton } from '@/components/ui/TactileButton';
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View, ScrollView, Platform } from 'react-native';
import Animated, { LinearTransition, FadeIn, FadeOut } from 'react-native-reanimated';

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
    <Animated.View 
      layout={LinearTransition} 
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.container, { backgroundColor: colors.background, borderRadius: 16, overflow: 'hidden' }]}
    >
      <ScrollView
         keyboardShouldPersistTaps="handled"
         showsVerticalScrollIndicator={false}
         bounces={false}
      >
        <ThemedView style={{ backgroundColor: 'transparent' }}>
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
            maxLength={12}
          />
          <ThemedText style={{ position: 'absolute', right: 12, top: 14, fontSize: 12, opacity: 0.5 }}>
            {name.length}/12
          </ThemedText>
        </View>

        {/* Quick icon choices */}
        <Animated.View layout={LinearTransition} style={{ marginBottom: 16 }}>
          <ThemedText style={{ fontWeight: '600', marginBottom: 8 }}>Icon:</ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {['water', 'barbell', 'book', 'moon', 'briefcase', 'leaf', 'alarm', 'flame'].map((iconName) => (
              <TactileButton
                key={iconName}
                onPress={() => setIcon(iconName)}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  borderWidth: 1, borderColor: colors.habitStroke,
                  backgroundColor: icon === iconName ? colors.tint : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                hapticType={HapticType.Selection}
              >
                <Ionicons name={iconName as any} size={20} color={icon === iconName ? '#FFF' : colors.text} />
              </TactileButton>
            ))}

            {/* Clear Button */}
            <TactileButton
              onPress={() => setIcon(undefined)}
              style={{
                width: 40, height: 40, borderRadius: 20,
                borderWidth: 1, borderColor: colors.habitStroke,
                justifyContent: 'center', alignItems: 'center',
              }}
              hapticType={HapticType.Selection}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TactileButton>
          </View>
        </Animated.View>

        <Animated.View layout={LinearTransition} style={styles.actions}>
          {onCancel && (
            <TactileButton
              style={[styles.cancelButton, { borderColor: colors.habitStroke }]}
              onPress={onCancel}
              hapticType={HapticType.Selection}
            >
              <ThemedText style={styles.cancelButtonText} lightColor={colors.text} darkColor={colors.text}>
                Cancel
              </ThemedText>
            </TactileButton>
          )}

          <TactileButton
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={name.trim().length === 0}
            hapticType={HapticType.ImpactMedium}
          >
            <ThemedText style={styles.submitButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              Add Habit
            </ThemedText>
          </TactileButton>
        </Animated.View>
      </ThemedView>
    </ScrollView>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    alignItems: 'stretch',
    minHeight: 44,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});


