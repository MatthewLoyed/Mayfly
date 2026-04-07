import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  ScrollView,
  Platform
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown 
} from 'react-native-reanimated';
import { X, Sprout, Milestone, Trees, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DashboardInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardInfoDialog({ isOpen, onClose }: DashboardInfoDialogProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  if (!isOpen) return null;

  const InfoItem = ({ icon: Icon, title, description, color }: any) => (
    <View style={styles.infoItem}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.infoDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(200)} 
          exiting={FadeOut.duration(200)} 
          style={styles.backdrop} 
        />
      </Pressable>

      <View style={styles.sheetContainer}>
        <Animated.View 
          entering={SlideInDown.duration(350).springify().damping(18)}
          exiting={SlideOutDown.duration(250)}
          style={[styles.sheet, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Ecosystem Guide</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Understanding your growth</Text>
            </View>
            <Pressable 
              onPress={() => {
                onClose();
                Haptics.selectionAsync();
              }}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSubtle }]}
            >
              <X size={20} color={theme.icon} />
            </Pressable>
          </View>
          
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <InfoItem 
              icon={Sprout}
              title="Planted"
              description="Your progress for today. It shows the ratio of habits completed versus your total goal."
              color={theme.primary}
            />
            
            <InfoItem 
              icon={Milestone}
              title="Harvests"
              description="The total number of habit completions you've achieved since you began your journey."
              color={theme.habitComplete}
            />

            <InfoItem 
              icon={Trees}
              title="Growth Forest"
              description="A weekly breakdown of your activity. Each tree represents a day; taller trees mean more habits harvested."
              color="#9CAF88"
            />

            <InfoItem 
              icon={Zap}
              title="Cycle of Growth"
              description="Long-term projects (Pursuits) evolve through stages: Egg → Larva → Pupa → Adult. Log sessions to advance."
              color={theme.streak}
            />

            <Pressable
              onPress={() => {
                onClose();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={({ pressed }) => [
                styles.doneButton,
                { backgroundColor: theme.primary },
                pressed && styles.doneButtonPressed
              ]}
            >
              <Text style={[styles.doneButtonText, { color: theme.background }]}>Understood</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
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
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingTop: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
  doneButton: {
    marginTop: 12,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
