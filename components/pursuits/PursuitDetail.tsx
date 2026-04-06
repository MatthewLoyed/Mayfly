import React, { useState } from 'react';
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
  FadeInUp,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Plus, Calendar, Clock, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MayflyVisual } from './MayflyVisual';
import { LogSessionDialog } from './LogSessionDialog';
import type { Pursuit, Session } from './types';


interface PursuitDetailProps {
  pursuitId: string;
  pursuits: Pursuit[];
  onBack: () => void;
  onUpdatePursuit: (pursuit: Pursuit) => void;
}

export function PursuitDetail({ pursuitId, pursuits, onBack, onUpdatePursuit }: PursuitDetailProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  
  const pursuit = pursuits.find((p) => p.id === pursuitId);
  const [sessions, setSessions] = useState<Session[]>(pursuit?.sessions || []);

  React.useEffect(() => {
    if (!pursuit) {
      onBack();
    }
  }, [pursuit, onBack]);

  if (!pursuit) {
    return null;
  }

  const totalHours = Math.round(
    sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );

  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(pursuit.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const stageNames = ["Emerging", "Growing", "Flourishing", "Soaring"];
  const stageDescriptions = [
    "Every journey begins with a single step. You're planting the seed.",
    "Consistency is building. Your dedication is taking root.",
    "Growth is visible. You're developing your craft with confidence.",
    "You're in full flight. This pursuit is a part of who you are.",
  ];

  const handleLogSession = (session: { duration: number; note?: string }) => {
    const newSession: Session = {
      ...session,
      date: new Date().toISOString().split("T")[0],
    };
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    
    // Also update parent state
    if (pursuit) {
      onUpdatePursuit({
        ...pursuit,
        sessions: updatedSessions,
        totalSessions: updatedSessions.length,
      });
    }
    
    setIsLogDialogOpen(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={[theme.background, theme.backgroundSubtle]}
        style={StyleSheet.absoluteFill}
      />

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
            <Pressable 
              onPress={() => {
                onBack();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color={theme.icon} />
              <Text style={[styles.backText, { color: theme.textSecondary }]}>Back to Pursuits</Text>
            </Pressable>
          </Animated.View>

          {/* Hero Card */}
          <Animated.View 
            entering={FadeInUp.delay(100).duration(800).springify()}
            style={[styles.heroCard, { backgroundColor: theme.cardBackground }]}
          >
            <LinearGradient
              colors={[`${pursuit.color}66`, `${pursuit.color}22`]}
              style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.heroHeader}>
              <View style={styles.heroInfo}>
                <Text style={[styles.heroCategory, { color: theme.textSecondary }]}>{pursuit.category}</Text>
                <Text style={[styles.heroTitle, { color: theme.text }]}>{pursuit.title}</Text>
                <Text style={[styles.heroDesc, { color: theme.text }]}>{stageDescriptions[pursuit.stage]}</Text>
              </View>
              <MayflyVisual stage={pursuit.stage} color={pursuit.color} />
            </View>

            {/* Hero Stats */}
            <View style={styles.heroStats}>
              <View style={[styles.statBox, { backgroundColor: theme.backgroundSubtle + '99' }]}>
                <View style={styles.statIcon}><Calendar size={18} color={theme.icon} /></View>
                <Text style={[styles.statValue, { color: theme.text }]}>{daysSinceStart}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>days</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.backgroundSubtle + '99' }]}>
                <View style={styles.statIcon}><Clock size={18} color={theme.icon} /></View>
                <Text style={[styles.statValue, { color: theme.text }]}>{totalHours}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>hours</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.backgroundSubtle + '99' }]}>
                <View style={styles.statIcon}><TrendingUp size={18} color={theme.icon} /></View>
                <Text style={[styles.statValue, { color: theme.text }]}>{sessions.length}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>sessions</Text>
              </View>
            </View>
          </Animated.View>

          {/* Growth Content */}
          <View style={[styles.growthPanel, { backgroundColor: theme.cardBackground, borderColor: theme.habitStroke + '33' }]}>
             <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Current Stage</Text>
             <View style={styles.stageRow}>
                <View style={[styles.stageBadge, { backgroundColor: `${pursuit.color}66` }]}>
                    <Text style={[styles.stageBadgeText, { color: theme.text }]}>{stageNames[pursuit.stage]}</Text>
                </View>
             </View>
             <View style={styles.progressRow}>
                {[0, 1, 2, 3].map((s) => (
                    <View 
                        key={s} 
                        style={[
                            styles.progressItem, 
                            { backgroundColor: s <= pursuit.stage ? pursuit.color : `${pursuit.color}33` }
                        ]} 
                    />
                ))}
             </View>
          </View>

          {/* History */}
          <View style={styles.historyPanel}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Session History</Text>
            {sortedSessions.slice(0, 10).map((session, index) => (
                <Animated.View 
                    key={index}
                    entering={FadeInDown.delay(300 + index * 50).duration(500)}
                    style={[styles.historyCard, { backgroundColor: theme.cardBackground, borderColor: theme.habitStroke + '33' }]}
                >
                    <View style={styles.historyHeader}>
                         <View style={styles.historyDateRow}>
                            <View style={[styles.historyDot, { backgroundColor: pursuit.color }]} />
                            <Text style={[styles.historyDate, { color: theme.text }]}>
                                {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                         </View>
                         <Text style={[styles.historyDuration, { color: theme.textSecondary }]}>{session.duration} min</Text>
                    </View>
                    {session.note && <Text style={[styles.historyNote, { color: theme.textSecondary }]}>{session.note}</Text>}
                </Animated.View>
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
            setIsLogDialogOpen(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
            pressed && styles.fabPressed
          ]}
        >
          <Plus size={24} color={theme.background} />
          <Text style={[styles.fabText, { color: theme.background }]}>Log a Session</Text>
        </Pressable>
      </View>

      <LogSessionDialog
        isOpen={isLogDialogOpen}
        onClose={() => setIsLogDialogOpen(false)}
        onLog={handleLogSession}
        pursuitColor={pursuit.color}
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
  header: {
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  heroCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroInfo: {
    flex: 1,
    marginRight: 16,
  },
  heroCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  growthPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#4b5563',
    letterSpacing: 2,
    marginBottom: 16,
  },
  stageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stageBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stageBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
  },
  progressItem: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  historyPanel: {
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  historyDuration: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  historyNote: {
    fontSize: 13,
    color: '#4b5563',
    paddingLeft: 16,
    lineHeight: 18,
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
