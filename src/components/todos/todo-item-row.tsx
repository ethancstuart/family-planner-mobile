import { memo, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2, Calendar } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import type { TodoItem } from "@/types";

interface TodoItemRowProps {
  item: TodoItem;
  onToggle: (id: string, completed: boolean) => void;
  onAssign: (id: string) => void;
  onDelete: (id: string) => void;
  assignedName?: string | null;
}

export const TodoItemRow = memo(function TodoItemRow({
  item,
  onToggle,
  onAssign,
  onDelete,
  assignedName,
}: TodoItemRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const isOverdue =
    !item.completed &&
    item.due_date &&
    new Date(item.due_date + "T00:00:00") < new Date(new Date().toDateString());

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id, !item.completed);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onDelete(item.id);
  };

  const formatDueDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.getTime() === today.getTime()) return "Today";
    if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const initials = assignedName
    ? assignedName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <Pressable
        onPress={handleDelete}
        className="bg-red-500 items-center justify-center rounded-r-xl"
        style={{ width: 72 }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Trash2 size={20} color="#fff" />
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <View className="flex-row items-center bg-white border border-gray-100 rounded-xl px-3 py-3">
        {/* Round checkbox */}
        <Pressable
          onPress={handleToggle}
          accessibilityLabel={item.completed ? "Mark incomplete" : "Mark complete"}
        >
          <View
            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              item.completed
                ? "bg-purple-600 border-purple-600"
                : "border-gray-300"
            }`}
          >
            {item.completed && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </View>
        </Pressable>

        {/* Title */}
        <Text
          className={`flex-1 ml-3 text-sm font-medium ${
            item.completed ? "text-gray-400 line-through" : "text-gray-900"
          }`}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Due date badge */}
        {item.due_date && (
          <View
            className={`flex-row items-center gap-1 rounded-md px-1.5 py-0.5 ml-2 ${
              isOverdue ? "bg-red-50" : "bg-gray-100"
            }`}
          >
            <Calendar size={10} color={isOverdue ? "#ef4444" : "#9ca3af"} />
            <Text
              className={`text-[10px] font-medium ${
                isOverdue ? "text-red-500" : "text-gray-500"
              }`}
            >
              {formatDueDate(item.due_date)}
            </Text>
          </View>
        )}

        {/* Assignee initials */}
        {initials && (
          <Pressable
            onPress={() => onAssign(item.id)}
            className="ml-2 w-6 h-6 rounded-full bg-purple-100 items-center justify-center"
          >
            <Text className="text-[10px] font-bold text-purple-700">
              {initials}
            </Text>
          </Pressable>
        )}

        {/* Assign button (no assignee) */}
        {!initials && !item.completed && (
          <Pressable
            onPress={() => onAssign(item.id)}
            className="ml-2 w-6 h-6 rounded-full border border-dashed border-gray-300 items-center justify-center"
          >
            <Text className="text-[10px] text-gray-400">+</Text>
          </Pressable>
        )}
      </View>
    </Swipeable>
  );
});
