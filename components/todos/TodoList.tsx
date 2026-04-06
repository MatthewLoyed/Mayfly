import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { reorderTodos, updateTodoDetails } from "@/services/todo-service";
import { type Todo } from "@/types/todo";
import { format, isSameDay, addDays, startOfDay, parseISO } from "date-fns";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { LinearTransition } from "react-native-reanimated";
import { HapticType, TactileButton } from "@/components/ui/TactileButton";
import { AddTodoForm } from "./AddTodoForm";
import { TodoDetailsModal } from "./TodoDetailsModal";
import { TodoItem } from "./TodoItem";
import { TodoSectionHeader } from "./TodoSectionHeader";

interface TodoListProps {
  todos: Todo[];
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (text: string, priority: boolean) => void;
  emptyMessage?: string;
  onSaveDetails?: (
    todoId: string,
    details: { dueAt: string | null; estimatedMinutes: number | null },
  ) => void | Promise<void>;
  onDeleteTodo?: (todoId: string) => void;
  onRefresh?: () => void | Promise<void>;
}

type ListItem = 
  | { id: string; type: 'header'; title: string; date: string | null; collapsed: boolean; count: number }
  | { id: string; type: 'todo'; data: Todo };

/**
 * Scrollable list of todos with add form and drag-and-drop reordering
 */
export function TodoList({
  todos,
  onToggleTodo,
  onAddTodo,
  emptyMessage,
  onSaveDetails,
  onDeleteTodo,
  onRefresh,
}: TodoListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Todo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const emptyPulse = useRef(new Animated.Value(0.8)).current;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  useEffect(() => {
    if (todos.length === 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(emptyPulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(emptyPulse, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [todos.length, emptyPulse]);

  const flattenedData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [
      { title: 'Today', date: today },
      { title: 'Tomorrow', date: addDays(today, 1) },
      ...Array.from({ length: 5 }, (_, i) => {
        const d = addDays(today, i + 2);
        return { title: format(d, 'EEEE'), date: d };
      }),
    ];

    const result: ListItem[] = [];

    days.forEach((day) => {
      const sectionTodos = todos.filter((t) => {
        // If it's the Today section, also include unscheduled todos (legacy/fallback)
        if (!t.dueAt) return day.title === 'Today';
        return isSameDay(parseISO(t.dueAt), day.date);
      });

      const sectionId = format(day.date, 'yyyy-MM-dd');
      const isCollapsed = collapsedSections[sectionId] || false;

      result.push({
        id: `header-${sectionId}`,
        type: 'header',
        title: day.title,
        date: day.date ? day.date.toISOString() : null,
        collapsed: isCollapsed,
        count: sectionTodos.length,
      });

      if (!isCollapsed) {
        sectionTodos.forEach((todo) => {
          result.push({
            id: todo.id,
            type: 'todo',
            data: todo,
          });
        });
      }
    });

    return result;
  }, [todos, collapsedSections]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleAddTodo = (text: string, priority: boolean) => {
    onAddTodo(text, priority);
    setIsAdding(false);
  };

  const handleDragEnd = async ({ data }: { data: ListItem[] }) => {
    // Find todos and their new potential due dates
    let currentNewDate: string | null | undefined = undefined;
    const finalTodoOrder: string[] = [];
    const updates: Promise<any>[] = [];

    data.forEach((item) => {
      if (item.type === 'header') {
        currentNewDate = item.date;
      } else if (item.type === 'todo') {
        finalTodoOrder.push(item.id);
        
        // If the todo moved to a new section, update its dueAt
        if (currentNewDate !== undefined && item.data.dueAt !== currentNewDate) {
          updates.push(updateTodoDetails(item.id, {
            dueAt: currentNewDate,
            estimatedMinutes: item.data.estimatedMinutes ?? null
          }));
        }
      }
    });

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (updates.length > 0) {
        await Promise.all(updates);
      }
      // Notify parent to refresh data
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Failed to reorder/reschedule todos:", error);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ListItem>) => {
    if (item.type === 'header') {
      const sectionId = item.date ? format(parseISO(item.date), 'yyyy-MM-dd') : 'unscheduled';
      return (
        <TodoSectionHeader
          title={item.title}
          count={item.count}
          isCollapsed={item.collapsed}
          onToggle={() => toggleSection(sectionId)}
        />
      );
    }

    return (
      <TodoItem
        todo={item.data}
        onToggle={() => onToggleTodo(item.data.id)}
        onPress={() => {
          Haptics.selectionAsync();
          setSelected(item.data);
          setShowDetails(true);
        }}
        drag={() => {
          Haptics.selectionAsync();
          if (drag) drag();
        }}
        isActive={isActive}
        onDelete={() => onDeleteTodo && onDeleteTodo(item.data.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      {todos.length === 0 ? (
        <Animated.View style={[styles.emptyContainer, { opacity: emptyPulse }]}>
          <ThemedText type="subtitle" style={styles.emptyText}>
            {emptyMessage || "No todos yet. Add one to get started!"}
          </ThemedText>
        </Animated.View>
      ) : (
        <DraggableFlatList
          data={flattenedData}
          onDragEnd={handleDragEnd}
          keyExtractor={(item) => item.id}
          // @ts-ignore - Library types might be outdated
          containerStyle={styles.list}
          contentContainerStyle={styles.listContent}
          // @ts-ignore
          itemLayoutAnimation={LinearTransition}
          renderItem={renderItem}
        />
      )}


      {/* Floating add button */}
      <TactileButton
        onPress={() => setIsAdding(true)}
        hapticType={HapticType.ImpactMedium}
        accessibilityRole="button"
        accessibilityLabel="Add Todo"
        scaleValue={0.9}
        style={[
          styles.fab,
          { backgroundColor: colors.primary, ...styles.fabWrapper },
        ]}
      >
        <IconSymbol name="plus" size={32} color="#FFFFFF" />
      </TactileButton>

      {/* Modal for adding todo */}
      <Modal
        visible={isAdding}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAdding(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={() => setIsAdding(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.modalContent, { flex: 1, justifyContent: 'center' }]}
          >
            <AddTodoForm
              onSubmit={handleAddTodo}
              onCancel={() => setIsAdding(false)}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <TodoDetailsModal
        visible={showDetails}
        todo={selected}
        onClose={() => setShowDetails(false)}
        onSave={async (details) => {
          if (selected && onSaveDetails) {
            await onSaveDetails(selected.id, details);
          }
          setShowDetails(false);
        }}
        onDelete={async (id) => {
          if (onDeleteTodo) {
            await onDeleteTodo(id);
          }
          setShowDetails(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    opacity: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  fabWrapper: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
  },
});
