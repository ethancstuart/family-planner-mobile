import { memo } from "react";
import { View, Text, Pressable, ActionSheetIOS, Platform, Alert } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { MealSlotCard } from "./meal-slot-card";
import { MEAL_TYPE_LABELS } from "@/lib/constants";
import type { MealPlanSlot, MealType } from "@/types";

interface MealSlotProps {
  mealType: MealType;
  slot: MealPlanSlot | undefined;
  onAddMeal: () => void;
  onViewRecipe: (recipeId: string) => void;
  onSwapMeal: () => void;
  onRemoveMeal: (slotId: string) => void;
}

export const MealSlot = memo(function MealSlot({
  mealType,
  slot,
  onAddMeal,
  onViewRecipe,
  onSwapMeal,
  onRemoveMeal,
}: MealSlotProps) {
  if (!slot) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onAddMeal();
        }}
        className="border border-dashed border-gray-300 rounded-xl py-3 px-3 flex-row items-center justify-center active:bg-gray-50"
      >
        <Plus size={14} color="#9ca3af" />
        <Text className="text-sm text-gray-400 ml-1">
          {MEAL_TYPE_LABELS[mealType]}
        </Text>
      </Pressable>
    );
  }

  const showSlotActions = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const options = ["View Recipe", "Swap", "Remove", "Cancel"];
    const destructiveButtonIndex = 2;
    const cancelButtonIndex = 3;

    const handleAction = (index: number) => {
      switch (index) {
        case 0:
          if (slot.recipe_id) onViewRecipe(slot.recipe_id);
          break;
        case 1:
          onSwapMeal();
          break;
        case 2:
          onRemoveMeal(slot.id);
          break;
      }
    };

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex },
        handleAction
      );
    } else {
      Alert.alert("Meal Options", undefined, [
        { text: "View Recipe", onPress: () => handleAction(0) },
        { text: "Swap", onPress: () => handleAction(1) },
        { text: "Remove", style: "destructive", onPress: () => handleAction(2) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <MealSlotCard
      slot={slot}
      onPress={() => {
        if (slot.recipe_id) onViewRecipe(slot.recipe_id);
      }}
      onLongPress={showSlotActions}
    />
  );
});
