import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticType, TactileButton } from '@/components/ui/TactileButton';
import { Ionicons } from "@expo/vector-icons";
import { AppIcons } from '@/constants/icons';
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
      entering={FadeIn.duration(400).springify()}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition}
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.habitStroke + '30',
          borderWidth: 1,
        }
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="subtitle" style={{ fontSize: 24, fontWeight: '800' }}>
            New Seed
          </ThemedText>
          <ThemedText style={{ opacity: 0.6, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
            Plant a new habit
          </ThemedText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.backgroundSubtle,
                borderColor: colors.habitStroke + '40',
              },
            ]}
            placeholder="What will you cultivate?"
            placeholderTextColor={colors.icon + '80'}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSubmit}
            autoFocus
            maxLength={12}
          />
          <ThemedText style={styles.charCount}>
            {name.length}/12
          </ThemedText>
        </View>

        {/* Quick icon choices */}
        <View style={styles.iconSection}>
          <ThemedText style={styles.sectionLabel}>Growth Icon</ThemedText>
          <View style={styles.iconGrid}>
            {[AppIcons.water, AppIcons.barbell, AppIcons.book, AppIcons.moon, AppIcons.briefcase, AppIcons.leaf, AppIcons.alarm, AppIcons.flame].map((iconName) => (
              <TactileButton
                key={iconName}
                onPress={() => setIcon(iconName)}
                style={[
                  styles.iconButton,
                  {
                    borderColor: colors.habitStroke + '20',
                    backgroundColor: icon === iconName ? colors.primary : colors.backgroundSubtle,
                  }
                ]}
                hapticType={HapticType.Selection}
              >
                <Ionicons
                  name={iconName as any}
                  size={20}
                  color={icon === iconName ? '#FFF' : colors.text}
                />
              </TactileButton>
            ))}

            <TactileButton
              onPress={() => setIcon(undefined)}
              style={[styles.iconButton, { borderColor: colors.habitStroke + '20', backgroundColor: colors.backgroundSubtle }]}
              hapticType={HapticType.Selection}
            >
              <Ionicons name={AppIcons.close} size={20} color={colors.text} />
            </TactileButton>
          </View>
        </View>

        <View style={styles.actions}>
          {onCancel && (
            <TactileButton
              style={[styles.cancelButton, { borderColor: colors.habitStroke + '40' }]}
              onPress={onCancel}
              hapticType={HapticType.Selection}
            >
              <ThemedText style={[styles.buttonText, { color: colors.text }]}>
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
            <ThemedText style={[styles.buttonText, { color: '#FFF' }]}>
              Plant Seed
            </ThemedText>
          </TactileButton>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    gap: 24,
  },
  header: {
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    fontSize: 18,
    fontWeight: '600',
  },
  charCount: {
    position: 'absolute',
    right: 16,
    top: 20,
    fontSize: 12,
    opacity: 0.5,
    fontWeight: '700',
  },
  iconSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.6,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  submitButton: {
    flex: 2,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});


