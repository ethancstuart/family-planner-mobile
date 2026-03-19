import { View, Text } from "react-native";
import { parseDate, DAYS_OF_WEEK_SHORT, MEAL_TYPES } from "@family-planner/shared";
import { MealSlot } from "./meal-slot";
import type { MealPlanSlot, MealType, DayOfWeek } from "@/types";

interface DayColumnProps {
  weekStart: string;
  dayIndex: DayOfWeek;
  slots: MealPlanSlot[];
  isToday: boolean;
  onAddMeal: (dayOfWeek: DayOfWeek, mealType: MealType) => void;
  onViewRecipe: (recipeId: string) => void;
  onSwapMeal: (slot: MealPlanSlot) => void;
  onRemoveMeal: (slotId: string) => void;
}

export function DayColumn({
  weekStart,
  dayIndex,
  slots,
  isToday,
  onAddMeal,
  onViewRecipe,
  onSwapMeal,
  onRemoveMeal,
}: DayColumnProps) {
  const date = parseDate(weekStart);
  date.setDate(date.getDate() + dayIndex);
  const dayNum = date.getDate();

  const getSlotForMealType = (mealType: MealType) =>
    slots.find((s) => s.day_of_week === dayIndex && s.meal_type === mealType);

  return (
    <View
      className={`rounded-2xl p-3 ${isToday ? "bg-primary-50 border border-primary-200" : "bg-white border border-gray-100"}`}
    >
      {/* Day header */}
      <View className="items-center mb-3">
        <Text
          className={`text-xs font-semibold uppercase tracking-wide ${
            isToday ? "text-primary-600" : "text-gray-500"
          }`}
        >
          {DAYS_OF_WEEK_SHORT[dayIndex]}
        </Text>
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mt-0.5 ${
            isToday ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`text-base font-bold ${
              isToday ? "text-white" : "text-gray-900"
            }`}
          >
            {dayNum}
          </Text>
        </View>
      </View>

      {/* Meal slots */}
      <View className="gap-2">
        {(MEAL_TYPES as readonly MealType[]).map((mealType) => (
          <MealSlot
            key={mealType}
            mealType={mealType}
            slot={getSlotForMealType(mealType)}
            onAddMeal={() => onAddMeal(dayIndex, mealType)}
            onViewRecipe={onViewRecipe}
            onSwapMeal={() => {
              const existing = getSlotForMealType(mealType);
              if (existing) onSwapMeal(existing);
            }}
            onRemoveMeal={onRemoveMeal}
          />
        ))}
      </View>
    </View>
  );
}
