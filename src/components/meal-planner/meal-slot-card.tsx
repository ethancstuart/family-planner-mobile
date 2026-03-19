import { View, Text, Pressable } from "react-native";
import { Clock } from "lucide-react-native";
import type { MealPlanSlot, MealType } from "@/types";
import { MEAL_TYPE_LABELS } from "@/lib/constants";

const MEAL_TYPE_COLORS: Record<MealType, string> = {
  breakfast: "#f59e0b", // amber-500
  lunch: "#14b8a6", // teal-500
  dinner: "#7c3aed", // purple-600
  snack: "#ec4899", // pink-500
};

interface MealSlotCardProps {
  slot: MealPlanSlot;
  onPress: () => void;
  onLongPress: () => void;
}

export function MealSlotCard({ slot, onPress, onLongPress }: MealSlotCardProps) {
  const recipe = slot.recipe;
  const color = MEAL_TYPE_COLORS[slot.meal_type as MealType] ?? "#7c3aed";
  const totalMinutes = recipe ? (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0) : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden active:opacity-80"
      style={{ flexDirection: "row" }}
    >
      {/* Color bar */}
      <View style={{ width: 4, backgroundColor: color }} />

      <View className="flex-1 p-2.5">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
          {recipe?.title ?? "Untitled"}
        </Text>

        <View className="flex-row items-center mt-1 gap-2">
          {totalMinutes > 0 && (
            <View className="flex-row items-center gap-0.5">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-400">{totalMinutes}m</Text>
            </View>
          )}
          <Text className="text-xs text-gray-400">
            {MEAL_TYPE_LABELS[slot.meal_type as MealType]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
