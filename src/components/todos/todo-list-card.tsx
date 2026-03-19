import { memo, useState, useCallback } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { ChevronDown, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useTodoItems } from "@/hooks/use-todos";
import {
  useAddTodoItem,
  useToggleTodoItem,
  useAssignTodoItem,
  useDeleteTodoItem,
  useDeleteTodoList,
} from "@/hooks/use-todo-mutations";

import { AddTodoInput } from "./add-todo-input";
import { TodoItemRow } from "./todo-item-row";
import type { TodoList, TodoItem } from "@/types";

const ACCENT_COLORS = [
  "#7c3aed", // purple
  "#8b5cf6", // violet
  "#a855f7", // fuchsia
  "#0d9488", // teal
  "#f59e0b", // amber
  "#3b82f6", // blue
];

interface TodoListCardProps {
  list: TodoList & { totalItems: number; completedItems: number };
  index: number;
  members: { user_id: string; full_name: string | null; email: string }[];
  userId: string;
  filter: string;
  onAssign: (itemId: string, listId: string) => void;
}

export const TodoListCard = memo(function TodoListCard({
  list,
  index,
  members,
  userId,
  filter,
  onAssign,
}: TodoListCardProps) {
  const [expanded, setExpanded] = useState(true);
  const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

  const { data: items = [] } = useTodoItems(list.id);
  const addItem = useAddTodoItem();
  const toggleItem = useToggleTodoItem();
  const deleteItem = useDeleteTodoItem();
  const deleteList = useDeleteTodoList();

  // Filter items based on active filter
  const filteredItems = filterItems(items, filter, userId);
  const uncompleted = filteredItems.filter((i) => !i.completed);
  const completed = filteredItems.filter((i) => i.completed);

  const handleAdd = useCallback(
    ({ title, dueDate }: { title: string; dueDate: string | null }) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addItem.mutate({ listId: list.id, title, dueDate });
    },
    [list.id, addItem]
  );

  const handleToggle = useCallback(
    (itemId: string, completed: boolean) => {
      toggleItem.mutate({ itemId, completed, listId: list.id });
    },
    [list.id, toggleItem]
  );

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      deleteItem.mutate({ itemId, listId: list.id });
    },
    [list.id, deleteItem]
  );

  const handleDeleteList = useCallback(() => {
    Alert.alert(
      "Delete list?",
      `"${list.title}" and all its items will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteList.mutate(
              { listId: list.id },
              { onError: () => Alert.alert("Error", "Failed to delete list.") }
            );
          },
        },
      ]
    );
  }, [list.id, list.title, deleteList]);

  const handleAssign = useCallback(
    (itemId: string) => {
      onAssign(itemId, list.id);
    },
    [list.id, onAssign]
  );

  const getMemberName = (assignedTo: string | null) => {
    if (!assignedTo) return null;
    const member = members.find((m) => m.user_id === assignedTo);
    return member?.full_name || member?.email || null;
  };

  return (
    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
      {/* Accent strip */}
      <View style={{ height: 2, backgroundColor: accentColor }} />

      {/* Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <View className="flex-row items-center gap-2 flex-1">
          <ChevronDown
            size={16}
            color="#9ca3af"
            style={{
              transform: [{ rotate: expanded ? "0deg" : "-90deg" }],
            }}
          />
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {list.title}
          </Text>
          <Text className="text-xs text-gray-400">
            {list.completedItems}/{list.totalItems}
          </Text>
        </View>

        <Pressable
          onPress={handleDeleteList}
          className="p-1.5 rounded-full active:bg-gray-100"
          hitSlop={8}
          accessibilityLabel="Delete list"
        >
          <Trash2 size={14} color="#9ca3af" />
        </Pressable>
      </Pressable>

      {/* Expanded content */}
      {expanded && (
        <GestureHandlerRootView>
          <View className="border-t border-gray-100 px-4 py-3 gap-2">
            <AddTodoInput onAdd={handleAdd} />

            {uncompleted.map((item) => (
              <TodoItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onAssign={handleAssign}
                onDelete={handleDeleteItem}
                assignedName={getMemberName(item.assigned_to)}
              />
            ))}

            {completed.length > 0 && (
              <View className="opacity-50 gap-2 mt-1">
                {completed.map((item) => (
                  <TodoItemRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onAssign={handleAssign}
                    onDelete={handleDeleteItem}
                    assignedName={getMemberName(item.assigned_to)}
                  />
                ))}
              </View>
            )}
          </View>
        </GestureHandlerRootView>
      )}
    </View>
  );
});

function filterItems(items: TodoItem[], filter: string, userId: string): TodoItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case "mine":
      return items.filter((i) => i.assigned_to === userId);
    case "overdue":
      return items.filter(
        (i) =>
          !i.completed &&
          i.due_date &&
          new Date(i.due_date + "T00:00:00") < today
      );
    case "completed":
      return items.filter((i) => i.completed);
    default:
      return items;
  }
}
