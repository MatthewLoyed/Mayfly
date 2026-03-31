import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Plus, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PursuitCard } from './PursuitCard';
import { AddPursuitDialog } from './AddPursuitDialog';
import type { Pursuit } from './types';

const { width, height } = Dimensions.get('window');

const mockPursuits: Pursuit[] = [
  {
    id: "1",
    title: "Watercolor Painting",
    category: "Creative",
    startDate: "2026-01-15",
    sessions: [
      { date: "2026-01-15", duration: 45, note: "Practiced basic washes" },
      { date: "2026-01-18", duration: 60, note: "Landscape study" },
      { date: "2026-01-22", duration: 30, note: "Color mixing experiments" },
      { date: "2026-02-01", duration: 75, note: "First complete piece" },
      { date: "2026-02-08", duration: 90, note: "Portrait attempt" },
      { date: "2026-02-15", duration: 60, note: "Botanical studies" },
      { date: "2026-03-01", duration: 120, note: "Large canvas project" },
      { date: "2026-03-10", duration: 45, note: "Abstract experiments" },
      { date: "2026-03-20", duration: 90, note: "Gallery-worthy piece" },
    ],
    totalSessions: 9,
    stage: 2,
    color: "#B5A8D6", // Lavender Mist
  },
  {
    id: "2",
    title: "Spanish Conversation",
    category: "Language",
    startDate: "2026-02-01",
    sessions: [
      { date: "2026-02-01", duration: 30, note: "Basic greetings" },
      { date: "2026-02-03", duration: 30, note: "Numbers and colors" },
      { date: "2026-02-06", duration: 45, note: "Present tense verbs" },
      { date: "2026-02-10", duration: 30, note: "Conversation practice" },
      { date: "2026-03-15", duration: 60, note: "Video call with tutor" },
    ],
    totalSessions: 5,
    stage: 1,
    color: "#E6B874", // Sunset Gold
  },
  {
    id: "3",
    title: "Morning Meditation",
    category: "Mindfulness",
    startDate: "2026-03-01",
    sessions: [
      { date: "2026-03-01", duration: 10, note: "Breath focus" },
      { date: "2026-03-02", duration: 15, note: "Body scan" },
      { date: "2026-03-05", duration: 10, note: "Loving-kindness" },
    ],
    totalSessions: 3,
    stage: 0,
    color: "#9CAF88", // Sage Growth
  },
  {
    id: "4",
    title: "Guitar Practice",
    category: "Music",
    startDate: "2025-11-10",
    sessions: Array.from({ length: 15 }, (_, i) => ({
      date: new Date(2025, 10, 10 + i * 3).toISOString().split("T")[0],
      duration: 45,
      note: `Practice session ${i + 1}`,
    })),
    totalSessions: 15,
    stage: 3,
    color: "#B5A8D6", // Lavender Mist
  },
];

interface PursuitsHomeProps {
  onSelectPursuit: (id: string) => void;
}

export function PursuitsHome({ onSelectPursuit }: PursuitsHomeProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const [pursuits, setPursuits] = useState<Pursuit[]>(mockPursuits);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const bgFloatY1 = useSharedValue(0);
  const bgFloatY2 = useSharedValue(0);

  useEffect(() => {
    bgFloatY1.value = withRepeat(
      withTiming(20, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bgFloatY2.value = withRepeat(
      withTiming(-20, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const bgStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: bgFloatY1.value }, { scale: 1 + bgFloatY1.value / 200 }],
  }));

  const bgStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: bgFloatY2.value }, { scale: 1.2 - bgFloatY2.value / 200 }],
  }));

  const handleAddPursuit = (pursuit: Omit<Pursuit, "id" | "totalSessions" | "stage">) => {
    const newPursuit: Pursuit = {
      ...pursuit,
      id: Date.now().toString(),
      totalSessions: 0,
      stage: 0,
    };
    setPursuits([...pursuits, newPursuit]);
    setIsAddDialogOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSubtle]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated background elements */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.bgBlob, styles.bgBlob1, bgStyle1, { backgroundColor: theme.secondary }]} />
        <Animated.View style={[styles.bgBlob, styles.bgBlob2, bgStyle2, { backgroundColor: theme.tint }]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View 
            entering={FadeInDown.duration(800).springify()}
            style={styles.header}
          >
            <View style={styles.headerTitleRow}>
              <Sparkles size={24} color={theme.primary} />
              <Text style={[styles.title, { color: theme.text }]}>Pursuits</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Watch your passions take flight</Text>
          </Animated.View>

          {/* List */}
          <View style={styles.list}>
            {pursuits.map((pursuit, index) => (
              <PursuitCard
                key={pursuit.id}
                pursuit={pursuit}
                index={index}
                onPress={onSelectPursuit}
              />
            ))}
          </View>

          {/* Spacer for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Pressable
          onPress={() => {
            setIsAddDialogOpen(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
            pressed && styles.fabPressed
          ]}
        >
          <Plus size={24} color={theme.background} />
          <Text style={[styles.fabText, { color: theme.background }]}>Begin a New Pursuit</Text>
        </Pressable>
      </View>

      <AddPursuitDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddPursuit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(40px)', // Note: blur filter might not work on all RN platforms, typically use blur attribute or separate strategy
    opacity: 0.15,
  },
  bgBlob1: {
    top: 100,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: '#ddd6fe',
  },
  bgBlob2: {
    bottom: 200,
    left: -80,
    width: 250,
    height: 250,
    backgroundColor: '#bfdbfe',
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  list: {
    gap: 0, // Using margins in PursuitCard for staggered effect
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 999,
    gap: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
