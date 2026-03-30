import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { CheckCircle2, Circle, Sprout, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { ThemedText } from '../themed-text';
import { TactileButton, HapticType } from '../ui/TactileButton';

interface RecapSectionProps {
    priorityTodos: { id: string; text: string; completed: boolean }[];
    nextHabit?: { id: string; name: string; color: string; icon?: string };
    onToggleTodo: (id: string) => void;
    onCompleteHabit: (id: string) => void;
    onViewAllTodos: () => void;
    onViewGarden: () => void;
}

export function RecapSection({
    priorityTodos,
    nextHabit,
    onToggleTodo,
    onCompleteHabit,
    onViewAllTodos,
    onViewGarden
}: RecapSectionProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'dark'];

    return (
        <View style={styles.container}>
            {/* Top 3 Todos Section */}
            <Animated.View 
                entering={FadeInDown.delay(100).duration(800)}
                style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
            >
                <View style={styles.cardHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Today's Essentials</ThemedText>
                    <Pressable onPress={onViewAllTodos}>
                        <ThemedText style={[styles.seeAll, { color: colors.primary }]}>See All</ThemedText>
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
                        <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No priorities yet. Focus on what matters.
                        </ThemedText>
                    )}
                </View>
            </Animated.View>

            {/* Next Habit Section */}
            {nextHabit && (
                <Animated.View 
                    entering={FadeInDown.delay(300).duration(800)}
                    style={[styles.habitCard, { backgroundColor: colors.cardBackground, borderColor: colors.habitStroke + '20' }]}
                >
                    <View style={styles.habitContent}>
                        <View style={[styles.habitIconContainer, { backgroundColor: nextHabit.color + '20' }]}>
                            <Sprout size={24} color={nextHabit.color} />
                        </View>
                        <View style={styles.habitTextContainer}>
                            <ThemedText style={[styles.habitLabel, { color: colors.textSecondary }]}>Next to Nurture</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.habitName}>{nextHabit.name}</ThemedText>
                        </View>
                        <TactileButton
                            onPress={() => onCompleteHabit(nextHabit.id)}
                            style={[styles.completeButton, { backgroundColor: nextHabit.color }]}
                            hapticType={HapticType.ImpactMedium}
                        >
                            <ArrowRight size={20} color="#FFF" />
                        </TactileButton>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 16,
        paddingBottom: 8,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        letterSpacing: 0.5,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    todoList: {
        gap: 12,
    },
    todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 4,
    },
    todoText: {
        fontSize: 16,
        flex: 1,
    },
    todoCompleted: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 10,
    },
    habitCard: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
    },
    habitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    habitIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    habitTextContainer: {
        flex: 1,
    },
    habitLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 2,
    },
    habitName: {
        fontSize: 18,
    },
    completeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
