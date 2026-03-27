import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOut, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Calendar, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MayflyVisual } from './MayflyVisual';
import type { Pursuit } from './types';

interface PursuitCardProps {
  pursuit: Pursuit;
  index: number;
  onPress: (id: string) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48 - 32; // Screen width - horizontal padding - staggered margin

export function PursuitCard({ pursuit, index, onPress }: PursuitCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const scale = useSharedValue(1);

  const totalHours = Math.round(
    pursuit.sessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );

  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(pursuit.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const stageNames = ["Emerging", "Growing", "Flourishing", "Soaring"];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    Haptics.selectionAsync();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    onPress(pursuit.id);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
      exiting={FadeOut}
      layout={Layout.springify()}
      style={[
        styles.cardContainer,
        {
          marginLeft: index % 2 === 0 ? 0 : 32,
          marginRight: index % 2 === 0 ? 32 : 0,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={[styles.card, animatedStyle, { backgroundColor: theme.cardBackground }]}>
          <LinearGradient
            colors={[`${pursuit.color}44`, `${pursuit.color}11`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.tagRow}>
                <Text style={[styles.category, { color: theme.textSecondary }]}>{pursuit.category}</Text>
                <View style={[styles.stageTag, { backgroundColor: `${pursuit.color}66` }]}>
                  <Text style={[styles.stageText, { color: theme.text }]}>{stageNames[pursuit.stage]}</Text>
                </View>
              </View>
              <Text style={[styles.title, { color: theme.text }]}>{pursuit.title}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Calendar size={14} color={theme.icon} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{daysSinceStart}d</Text>
                </View>
                <View style={styles.stat}>
                  <Clock size={14} color={theme.icon} />
                  <Text style={[styles.statText, { color: theme.textSecondary }]}>{totalHours}h</Text>
                </View>
              </View>
            </View>
            
            <MayflyVisual stage={pursuit.stage} color={pursuit.color} />
          </View>

          {/* Progress chart */}
          <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
              {pursuit.sessions.slice(-8).map((session, i) => {
                const height = Math.max((session.duration / 120) * 100, 10);
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.bar, 
                      { 
                        backgroundColor: pursuit.color, 
                        height: `${height}%`,
                        opacity: 0.6
                      }
                    ]} 
                  />
                );
              })}
            </View>
            <Text style={[styles.sessionsCount, { color: theme.textSecondary }]}>
              {pursuit.totalSessions} sessions logged
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stageTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stageText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  chartContainer: {
    marginTop: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    gap: 4,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  sessionsCount: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
