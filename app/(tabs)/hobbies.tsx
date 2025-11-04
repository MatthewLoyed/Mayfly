import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { WeeksCharacter } from '@/components/character/WeeksCharacter';
import { CharacterMessage } from '@/components/character/CharacterMessage';
import { generateMessage } from '@/services/message-generator';

/**
 * Hobbies placeholder screen
 */
export default function HobbiesScreen() {
  const message = "Hobbies coming soon! What makes you happy?";

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ThemedView style={styles.content}>
        <View style={styles.emptyContainer}>
          <WeeksCharacter size={120} mood="happy" animated={true} />
          <ThemedText type="title" style={styles.title}>
            Hobbies
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {message}
          </ThemedText>
          <ThemedText style={styles.description}>
            This feature will be coming soon. For now, focus on your habits and todos!
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 300,
  },
});

