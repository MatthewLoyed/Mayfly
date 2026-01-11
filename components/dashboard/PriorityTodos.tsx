import { ThemedText } from '@/components/themed-text';
import { StyleSheet, View } from 'react-native';

interface PriorityTodo {
    id: string;
    text: string;
}

interface PriorityTodosProps {
    todos: PriorityTodo[];
}

export function PriorityTodos({ todos }: PriorityTodosProps) {
    if (todos.length === 0) return null;

    return (
        <View style={styles.prioritySection}>
            <ThemedText type="defaultSemiBold" style={styles.priorityTitle}>
                Top {todos.length} Priorities
            </ThemedText>
            {todos.map((todo) => (
                <View key={todo.id} style={styles.priorityItem}>
                    <ThemedText style={styles.priorityText}>• {todo.text}</ThemedText>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    prioritySection: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(162, 155, 254, 0.1)',
    },
    priorityTitle: {
        marginBottom: 12,
        opacity: 0.8,
    },
    priorityItem: {
        marginBottom: 8,
    },
    priorityText: {
        fontSize: 16,
    },
});
