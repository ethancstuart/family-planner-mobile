import { useRef, useEffect } from "react";
import { ScrollView, View, RefreshControl, useWindowDimensions } from "react-native";
import { formatDate } from "@/lib/utils";
import { DayColumn } from "./day-column";
import type { MealPlanSlot, MealType, DayOfWeek } from "@/types";

interface WeekViewProps {
  weekStart: string;
  slots: MealPlanSlot[];
  isRefetching: boolean;
  onRefresh: () => void;
  onAddMeal: (dayOfWeek: DayOfWeek, mealType: MealType) => void;
  onViewRecipe: (recipeId: string) => void;
  onSwapMeal: (slot: MealPlanSlot) => void;
  onRemoveMeal: (slotId: string) => void;
}

export function WeekView({
  weekStart,
  slots,
  isRefetching,
  onRefresh,
  onAddMeal,
  onViewRecipe,
  onSwapMeal,
  onRemoveMeal,
}: WeekViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Phone: card width with peek of next day
  const cardWidth = isTablet ? undefined : width - 48;
  const todayDayIndex = getTodayDayIndex(weekStart);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (!isTablet && todayDayIndex !== null && scrollRef.current) {
      const offset = todayDayIndex * (cardWidth! + 12); // 12 = gap
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: offset, animated: false });
      }, 100);
    }
  }, [weekStart]);

  const days = Array.from({ length: 7 }, (_, i) => i as DayOfWeek);

  if (isTablet) {
    // Tablet: 7-column grid
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#7c3aed" />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          {days.map((dayIndex) => (
            <View key={dayIndex} style={{ flex: 1 }}>
              <DayColumn
                weekStart={weekStart}
                dayIndex={dayIndex}
                slots={slots}
                isToday={todayDayIndex === dayIndex}
                onAddMeal={onAddMeal}
                onViewRecipe={onViewRecipe}
                onSwapMeal={onSwapMeal}
                onRemoveMeal={onRemoveMeal}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Phone: horizontal snap scroll
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled={false}
      snapToInterval={cardWidth! + 12}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 12 }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#7c3aed" />
      }
    >
      {days.map((dayIndex) => (
        <View key={dayIndex} style={{ width: cardWidth }}>
          <DayColumn
            weekStart={weekStart}
            dayIndex={dayIndex}
            slots={slots}
            isToday={todayDayIndex === dayIndex}
            onAddMeal={onAddMeal}
            onViewRecipe={onViewRecipe}
            onSwapMeal={onSwapMeal}
            onRemoveMeal={onRemoveMeal}
          />
        </View>
      ))}
    </ScrollView>
  );
}

/** Returns the day-of-week index (0=Sun) if today falls within this week, else null. */
function getTodayDayIndex(weekStart: string): DayOfWeek | null {
  const today = new Date();
  const todayStr = formatDate(today);

  const start = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (formatDate(d) === todayStr) return i as DayOfWeek;
  }
  return null;
}
