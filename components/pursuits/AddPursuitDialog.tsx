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
import type { Pursuit } from './types';

interface AddPursuitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (pursuit: Omit<Pursuit, "id" | "totalSessions" | "stage">) => void;
}

const categories = [
  { name: "Creative", color: "#B5A8D6" }, // Lavender Mist
  { name: "Language", color: "#E6B874" }, // Sunset Gold
  { name: "Mindfulness", color: "#9CAF88" }, // Sage Growth
  { name: "Music", color: "#B5A8D6" },
  { name: "Fitness", color: "#9CAF88" },
  { name: "Learning", color: "#E6B874" },
  { name: "Craft", color: "#B5A8D6" },
  { name: "Writing", color: "#A0A0A0" }, // Stone Grey
];

export function AddPursuitDialog({ isOpen, onClose, onAdd }: AddPursuitDialogProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        category: selectedCategory.name,
        startDate: new Date().toISOString().split("T")[0],
        sessions: [],
        color: selectedCategory.color,
      });
      setTitle("");
      setSelectedCategory(categories[0]);
    }
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
              <Text style={[styles.headerTitle, { color: theme.text }]}>Begin a New Pursuit</Text>
              <Pressable 
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.backgroundSubtle }]}
              >
                <X size={20} color={theme.icon} />
              </Pressable>
            </View>

            <ScrollView bounces={false} style={styles.content}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>What do you want to pursue?</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Learn Piano, Morning Yoga..."
                  placeholderTextColor={theme.icon}
                  style={[styles.input, { borderColor: theme.habitStroke + '33', color: theme.text }]}
                  autoFocus
                />
              </View>

               <View style={styles.categorySection}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Choose a category</Text>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => {
                    const isSelected = selectedCategory.name === category.name;
                    return (
                      <Pressable
                        key={category.name}
                        onPress={() => {
                          setSelectedCategory(category);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.categoryItem,
                          { 
                            backgroundColor: isSelected ? `${category.color}99` : `${category.color}22`,
                            borderColor: isSelected ? category.color : 'transparent',
                          }
                        ]}
                      >
                        <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                onPress={() => {
                    handleSubmit();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                disabled={!title.trim()}
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: theme.primary },
                  !title.trim() && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed
                ]}
              >
                <Text style={[styles.submitButtonText, { color: theme.background }]}>Start Your Journey</Text>
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827',
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: '22.5%',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
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
