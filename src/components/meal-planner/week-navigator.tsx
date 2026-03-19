import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { parseDate, DAYS_OF_WEEK_SHORT } from "@family-planner/shared";

interface WeekNavigatorProps {
  weekStart: string;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onOpenMenu: () => void;
}

function formatWeekRange(weekStart: string): string {
  const start = parseDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}`;
}

export function WeekNavigator({
  weekStart,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onToday,
  onOpenMenu,
}: WeekNavigatorProps) {
  const handlePress = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => handlePress(onPrevWeek)}
          className="p-2 rounded-full active:bg-gray-100"
          hitSlop={8}
        >
          <ChevronLeft size={20} color="#374151" />
        </Pressable>

        <Text className="text-base font-semibold text-gray-900 min-w-[140px] text-center">
          {formatWeekRange(weekStart)}
        </Text>

        <Pressable
          onPress={() => handlePress(onNextWeek)}
          className="p-2 rounded-full active:bg-gray-100"
          hitSlop={8}
        >
          <ChevronRight size={20} color="#374151" />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-1">
        {!isCurrentWeek && (
          <Pressable
            onPress={() => handlePress(onToday)}
            className="px-3 py-1.5 rounded-full bg-primary-100 active:bg-primary-200"
          >
            <Text className="text-sm font-medium text-primary-700">Today</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => handlePress(onOpenMenu)}
          className="p-2 rounded-full active:bg-gray-100"
          hitSlop={8}
        >
          <MoreVertical size={20} color="#374151" />
        </Pressable>
      </View>
    </View>
  );
}
