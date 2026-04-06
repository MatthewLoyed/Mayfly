import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCharacterState } from '@/services/character-service';
import { getDatabase } from '@/services/database';
import { getAllHabits } from '@/services/habit-service';
import { getAllTodos } from '@/services/todo-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Settings screen with data export/import and clear data
 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      console.log('[Export] Starting data export...');
      
      // Ensure database is initialized
      await getDatabase();

      // Get all data in parallel for efficiency
      console.log('[Export] Fetching data from services...');
      const [habits, todos, characterState] = await Promise.all([
        getAllHabits(),
        getAllTodos(true),
        getCharacterState()
      ]);

      console.log(`[Export] Data retrieved: ${habits.length} habits, ${todos.length} todos.`);

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        habits,
        todos,
        characterState,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `mayfly-backup-${timestamp}.json`;

      if (Platform.OS === 'web') {
        processWebExport(jsonString, fileName);
      } else {
        await processMobileExport(jsonString, fileName);
      }
    } catch (error: any) {
      console.error('[Export] Critical Error:', error);
      Alert.alert(
        'Export Failed',
        error?.message || 'An unexpected error occurred during export. Please try again.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const processWebExport = (jsonString: string, fileName: string) => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      Alert.alert('Success', 'Data export initiated successfully.');
    } catch (e: any) {
      console.error('[Export] Web flow failed:', e);
      Alert.alert('Error', 'Failed to generate download on web browser.');
    }
  };

  const processMobileExport = async (jsonString: string, fileName: string) => {
    try {
      // In SDK 54, we use the new File and Paths API
      const docDir = Paths.document;
      if (!docDir) {
        throw new Error('FileSystem document storage not available');
      }

      const backupFile = new File(docDir, fileName);
      console.log(`[Export] Writing file to: ${backupFile.uri}`);
      
      // write() is synchronous in the new API but we wrap it for safety
      backupFile.write(jsonString);

      console.log('[Export] Checking sharing availability...');
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export Mayfly Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Complete', `Data saved locally to: ${backupFile.uri}`);
      }
    } catch (e: any) {
      console.error('[Export] Mobile flow failed:', e);
      throw e;
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
              await db.runAsync(
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
    loading = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onPress?: () => void;
    onValueChange?: (value: boolean) => void;
    showArrow?: boolean;
    destructive?: boolean;
    loading?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      disabled={(onPress === undefined && onValueChange === undefined) || loading}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        {loading ? (
          <ActivityIndicator size="small" color={destructive ? colors.warning : colors.primary} />
        ) : (
          <IconSymbol name={icon as any} size={24} color={destructive ? colors.warning : colors.icon} />
        )}
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

        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Data
          </ThemedText>

          <SettingItem
            icon="square.and.arrow.up"
            title="Export Data"
            subtitle="Download a backup of all your data"
            onPress={handleExportData}
            loading={isExporting}
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

