import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getDatabase } from '@/services/database';
import { getAllHabits } from '@/services/habit-service';
import { getAllTodos } from '@/services/todo-service';
import { getCharacterState } from '@/services/character-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * Settings screen with data export/import and clear data
 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await getDatabase();

      // Get all data
      const habits = await getAllHabits();
      const todos = await getAllTodos(true);
      const characterState = await getCharacterState();

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        habits,
        todos,
        characterState,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `mayfly-backup-${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        // Web: download file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        // Mobile: save and share
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonString);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Export Complete', `File saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all habits, todos, and character data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.clear();
              
              // Clear database
              const db = await getDatabase();
              await db.execAsync('DELETE FROM habits');
              await db.execAsync('DELETE FROM habit_completions');
              await db.execAsync('DELETE FROM todos');
              await db.execAsync('DELETE FROM character_state');
              
              // Reset character state
              const now = new Date().toISOString();
              await db.execAsync(
                'INSERT INTO character_state (id, mood, total_interactions, updated_at) VALUES (1, ?, 0, ?)',
                ['happy', now]
              );

              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    value,
    onPress,
    onValueChange,
    showArrow = false,
    destructive = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
    showArrow?: boolean;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      disabled={!onPress && !onValueChange}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <IconSymbol name={icon} size={24} color={destructive ? colors.warning : colors.icon} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="defaultSemiBold" style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText style={styles.settingSubtitle} darkColor="#999">
            {subtitle}
          </ThemedText>
        )}
      </View>
      {onValueChange !== undefined && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.habitIncomplete, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      )}
      {showArrow && (
        <IconSymbol name="chevron.right" size={20} color={colors.icon} style={styles.arrow} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Data
          </ThemedText>
          
          <SettingItem
            icon="square.and.arrow.up"
            title="Export Data"
            subtitle="Download a backup of all your data"
            onPress={handleExportData}
            showArrow
          />
          
          <SettingItem
            icon="trash.fill"
            title="Clear All Data"
            subtitle="Permanently delete all habits, todos, and character data"
            onPress={handleClearData}
            destructive
            showArrow
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            About
          </ThemedText>
          
          <SettingItem
            icon="info.circle.fill"
            title="App Name"
            subtitle="Mayfly"
            showArrow={false}
          />
          <SettingItem
            icon="info.circle.fill"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(162, 155, 254, 0.1)',
  },
  destructiveItem: {
    backgroundColor: 'rgba(255, 118, 117, 0.15)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  destructiveText: {
    color: '#E17055',
  },
  arrow: {
    marginLeft: 8,
  },
});

