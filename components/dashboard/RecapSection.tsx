import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import Animated, { 
    FadeInDown, 
    FadeInRight,
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    withSequence
} from 'react-native-reanimated';
import { CheckCircle2, Circle, Sprout, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { TactileButton, HapticType } from '../ui/TactileButton';

interface RecapSectionProps {
    priorityTodos: { id: string; text: string; completed: boolean }[];
    incompleteHabits?: { id: string; name: string; color: string; icon?: string | null }[];
    loginStreak?: number;
    onToggleTodo: (id: string) => void;
    onCompleteHabit: (id: string) => void;
    onViewAllTodos: () => void;
    onViewGarden: () => void;
}

export function RecapSection({
    priorityTodos,
    incompleteHabits = [],
    loginStreak = 0,
    onToggleTodo,
    onCompleteHabit,
    onViewAllTodos,
    onViewGarden
}: RecapSectionProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    // Pulse animation for the streak flame
    const flameScale = useSharedValue(1);
    
    useEffect(() => {
        flameScale.value = withRepeat(
            withSequence(
                withTiming(1.15, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [flameScale]);

    const animatedFlameStyle = useAnimatedStyle(() => ({
        transform: [{ scale: flameScale.value }]
    }));

    return (
        <View style={styles.container}>
            
            {/* Login Streak Banner */}
            {loginStreak > 0 && (
                <Animated.View entering={FadeInDown.delay(100).duration(800).springify()}>
                    <TactileButton 
                        style={[styles.streakBanner, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
                        hapticType={HapticType.Selection}
                        scaleValue={0.98}
                    >
                        <LinearGradient
                            colors={[colors.streak + '22', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.streakContent}>
                            <Animated.View style={[styles.flameContainer, { backgroundColor: colors.streak + '15' }, animatedFlameStyle]}>
                                <Flame size={28} color={colors.streak} />
                            </Animated.View>
                            <View style={styles.streakTextContainer}>
                                <ThemedText style={styles.streakLabel}>Daily Login Streak</ThemedText>
                                <ThemedText type="defaultSemiBold" style={[styles.streakValue, { color: colors.streak }]}>
                                    {loginStreak} {loginStreak === 1 ? 'Day' : 'Days'}
                                </ThemedText>
                            </View>
                        </View>
                    </TactileButton>
                </Animated.View>
            )}

            {/* Incomplete Habits */}
            {incompleteHabits.length > 0 && (
                <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.habitsWrapper}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            Needs Nurturing
                        </ThemedText>
                        <Pressable onPress={onViewGarden} hitSlop={10}>
                            <ThemedText style={[styles.seeAll, { color: colors.primary }]}>Garden</ThemedText>
                        </Pressable>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.habitsScrollContent}
                    >
                        {incompleteHabits.map((habit, index) => (
                            <Animated.View key={habit.id} entering={FadeInRight.delay(300 + index * 100).duration(600).springify()}>
                                <TactileButton
                                    onPress={() => onCompleteHabit(habit.id)}
                                    style={[styles.habitPill, { backgroundColor: habit.color + '15', borderColor: habit.color + '30' }]}
                                    hapticType={HapticType.ImpactMedium}
                                    scaleValue={0.94}
                                >
                                    <View style={[styles.habitIconBg, { backgroundColor: habit.color + '25' }]}>
                                        <Sprout size={18} color={habit.color} />
                                    </View>
                                    <ThemedText style={[styles.habitPillText, { color: colors.text }]} numberOfLines={1}>
                                        {habit.name}
                                    </ThemedText>
                                    <View style={[styles.habitCheckBtn, { backgroundColor: habit.color }]}>
                                        <CheckCircle2 size={14} color="#FFF" />
                                    </View>
                                </TactileButton>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}

            {/* Top Todos */}
            <Animated.View 
                entering={FadeInDown.delay(400).duration(800)}
                style={[styles.todoCard, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
            >
                <View style={[styles.sectionHeader, { marginBottom: 16 }]}>
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Top Priorities</ThemedText>
                    <Pressable onPress={onViewAllTodos} hitSlop={10}>
                        <ThemedText style={[styles.seeAll, { color: colors.primary }]}>All Tasks</ThemedText>
                    </Pressable>
                </View>

                <View style={styles.todoList}>
                    {priorityTodos.length > 0 ? (
                        priorityTodos.map((todo, index) => (
                            <TactileButton
                                key={todo.id}
                                onPress={() => onToggleTodo(todo.id)}
                                style={styles.todoItem}
                                hapticType={HapticType.Selection}
                                scaleValue={0.98}
                            >
                                {todo.completed ? (
                                    <CheckCircle2 size={20} color={colors.primary} />
                                ) : (
                                    <Circle size={20} color={colors.icon} />
                                )}
                                <ThemedText 
                                    style={[
                                        styles.todoText, 
                                        { color: todo.completed ? colors.textSecondary : colors.text },
                                        todo.completed && styles.todoCompleted
                                    ]}
                                    numberOfLines={1}
                                >
                                    {todo.text}
                                </ThemedText>
                            </TactileButton>
                        ))
                    ) : (
                        <ThemedText style={[styles.emptyText, { color: colors.text }]}>
                            No priorities right now. Relax!
                        </ThemedText>
                    )}
                </View>
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 20,
        paddingBottom: 8,
    },
    // Login Streak
    streakBanner: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    streakContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    flameContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    streakTextContainer: {
        flex: 1,
    },
    streakLabel: {
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: 'System',
        fontWeight: '700',
        opacity: 0.8,
        marginBottom: 2,
    },
    streakValue: {
        fontSize: 20,
        fontFamily: 'System',
    },
    // Sections General
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        letterSpacing: 0.5,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Habits
    habitsWrapper: {
        gap: 12,
    },
    habitsScrollContent: {
        paddingRight: 24, // extra padding for scrolling
        gap: 12,
    },
    habitPill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingRight: 16,
        borderRadius: 24,
        borderWidth: 1,
        gap: 10,
    },
    habitIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    habitPillText: {
        fontSize: 15,
        fontWeight: '500',
        maxWidth: 120, // keep it a pill
    },
    habitCheckBtn: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
    },
    // Todos
    todoCard: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 2,
    },
    todoList: {
        gap: 12,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    todoText: {
        fontSize: 16,
        flex: 1,
    },
    todoCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 10,
        opacity: 0.9,
    },
});
