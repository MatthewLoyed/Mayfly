import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type Todo } from '@/types/todo';
import { format, isToday, isTomorrow, addHours, addDays } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableWithoutFeedback, View, ScrollView } from 'react-native';
import { HapticType, TactileButton } from '../ui/TactileButton';
import Animated, { LinearTransition, FadeIn, FadeInDown, SlideInUp, SlideInDown } from 'react-native-reanimated';
import { Clock, Bell, Trash2, Calendar, Check, X, AlertCircle } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface TodoDetailsModalProps {
  visible: boolean;
  todo: Todo | null;
  onClose: () => void;
  onSave: (details: { dueAt: string | null; estimatedMinutes: number | null }) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

export function TodoDetailsModal({ visible, todo, onClose, onSave, onDelete }: TodoDetailsModalProps) {
  const [estimated, setEstimated] = useState<number | null>(todo?.estimatedMinutes ?? null);
  const [dueAt, setDueAt] = useState<string | null>(todo?.dueAt ?? null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  React.useEffect(() => {
    setEstimated(todo?.estimatedMinutes ?? null);
    setDueAt(todo?.dueAt ?? null);
  }, [todo]);

  const formattedDate = useMemo(() => {
    if (!dueAt) return 'No reminder set';
    const date = new Date(dueAt);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  }, [dueAt]);

  const durationLabel = useMemo(() => {
    if (estimated == null) return 'No duration set';
    if (estimated < 60) return `${estimated}m`;
    const hours = Math.floor(estimated / 60);
    const mins = estimated % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, [estimated]);

  const reminderPresets = [
    { label: 'In 1hr', value: addHours(new Date(), 1).toISOString() },
    { label: 'Today 5PM', value: new Date(new Date().setHours(17, 0, 0, 0)).toISOString() },
    { label: 'Tomorrow', value: addDays(new Date().setHours(9, 0, 0, 0), 1).toISOString() },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetContainer}
        >
          <Animated.View 
            entering={SlideInDown.duration(400)}
            style={[styles.sheet, { backgroundColor: colors.cardBackground }]}
          >
          {/* Header */}
          <View style={styles.header}>
             <View style={styles.headerTop}>
                <ThemedText style={[styles.headerLabel, { color: colors.textSecondary }]}>TASK DETAILS</ThemedText>
                <TactileButton onPress={onClose} style={styles.closeBtn} hapticType={HapticType.Selection}>
                   <X size={20} color={colors.textSecondary} />
                </TactileButton>
             </View>
             <ThemedText type="titleRounded" style={[styles.todoText, { color: colors.text }]}>
                {todo?.text || 'Untitled Task'}
             </ThemedText>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Duration Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                 <Clock size={16} color={colors.primary} />
                 <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>DURATION</ThemedText>
                 <ThemedText style={[styles.sectionValue, { color: colors.text }]}>{durationLabel}</ThemedText>
              </View>
              
              <View style={styles.choicesGrid}>
                {[5, 15, 30, 45, 60, 90].map((m) => (
                  <TactileButton
                    key={m}
                    style={[
                      styles.chip, 
                      { borderColor: colors.habitStroke + '30' },
                      estimated === m && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                    ]}
                    onPress={() => setEstimated(m)}
                    hapticType={HapticType.Selection}
                  >
                    <ThemedText style={[styles.chipText, estimated === m && { color: colors.primary, fontWeight: '600' }]}>
                       {m}m
                    </ThemedText>
                  </TactileButton>
                ))}
                <TactileButton 
                  style={[
                    styles.chip, 
                    { borderColor: colors.habitStroke + '30' },
                    estimated === null && { backgroundColor: colors.habitStroke + '10' }
                  ]} 
                  onPress={() => setEstimated(null)}
                  hapticType={HapticType.Selection}
                >
                  <ThemedText style={[styles.chipText, { opacity: 0.6 }]}>Clear</ThemedText>
                </TactileButton>
              </View>
            </View>

            {/* Reminder Section */}
            <View style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Bell size={16} color={colors.accent} />
                 <ThemedText style={[styles.sectionTitle, { color: colors.accent }]}>REMINDER</ThemedText>
                 <ThemedText style={[styles.sectionValue, { color: colors.text }]}>{formattedDate}</ThemedText>
              </View>

              <View style={styles.choicesGrid}>
                {reminderPresets.map((preset) => (
                   <TactileButton
                    key={preset.label}
                    style={[
                      styles.chip, 
                      { borderColor: colors.habitStroke + '30' },
                      dueAt === preset.value && { backgroundColor: colors.accent + '20', borderColor: colors.accent }
                    ]}
                    onPress={() => setDueAt(preset.value)}
                    hapticType={HapticType.Selection}
                  >
                    <ThemedText style={[styles.chipText, dueAt === preset.value && { color: colors.accent, fontWeight: '600' }]}>
                       {preset.label}
                    </ThemedText>
                  </TactileButton>
                ))}
                <TactileButton 
                  style={[styles.chip, { borderColor: colors.habitStroke + '30' }]} 
                  onPress={() => setDueAt(null)}
                  hapticType={HapticType.Selection}
                >
                  <ThemedText style={[styles.chipText, { opacity: 0.6 }]}>Clear</ThemedText>
                </TactileButton>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: colors.habitStroke + '20' }]}>
            {todo && onDelete && (
               <TactileButton 
               style={[styles.deleteBtn, { backgroundColor: colors.warning + '15' }]} 
               onPress={() => onDelete(todo.id)}
               hapticType={HapticType.ImpactMedium}
             >
               <Trash2 size={20} color={colors.warning} />
             </TactileButton>
            )}
            
            <View style={styles.footerRight}>
               <TactileButton 
                style={styles.cancelBtn} 
                onPress={onClose}
                hapticType={HapticType.Selection}
              >
                <ThemedText style={{ color: colors.textSecondary }}>Cancel</ThemedText>
              </TactileButton>

              <TactileButton
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={() => onSave({ dueAt, estimatedMinutes: estimated })}
                hapticType={HapticType.Success}
              >
                <Check size={20} color={colors.background} style={{ marginRight: 8 }} />
                <ThemedText style={[styles.saveBtnText, { color: colors.background }]}>Save Changes</ThemedText>
              </TactileButton>
            </View>
          </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: Math.round(Dimensions.get('window').height * 0.70),
    maxHeight: '85%',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 34, // Extra safe area
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: {
    fontSize: 26,
    lineHeight: 32,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sectionValue: {
    marginLeft: 'auto',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  footerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});


