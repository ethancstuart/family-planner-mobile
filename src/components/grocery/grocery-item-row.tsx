import { memo, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import type { GroceryItem } from "@/types";

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  large?: boolean;
}

export const GroceryItemRow = memo(function GroceryItemRow({
  item,
  onToggle,
  onDelete,
  large = false,
}: GroceryItemRowProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const quantityLabel = [
    item.quantity != null ? item.quantity : null,
    item.unit,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id, !item.checked);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swipeableRef.current?.close();
    onDelete(item.id);
  };

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
      <Pressable
        onPress={handleToggle}
        className={`flex-row items-center bg-white border border-gray-100 rounded-xl ${large ? "px-4 py-4" : "px-3 py-3"}`}
      >
        {/* Checkbox */}
        <View
          className={`${large ? "w-6 h-6" : "w-5 h-5"} rounded-md border-2 items-center justify-center ${
            item.checked
              ? "bg-purple-600 border-purple-600"
              : "border-gray-300"
          }`}
        >
          {item.checked && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </View>

        {/* Label */}
        <View className="flex-1 ml-3">
          <Text
            className={`${large ? "text-base" : "text-sm"} font-medium ${
              item.checked ? "text-gray-400 line-through" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {!!quantityLabel && (
            <Text className="text-xs text-gray-400 mt-0.5">
              {quantityLabel}
            </Text>
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
});
