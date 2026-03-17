import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarDays } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";

export default function MealsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Meal Planner</Text>
      </View>
      <EmptyState
        icon={<CalendarDays size={48} color="#d1d5db" />}
        title="Coming in v1.1"
        description="Drag-and-drop meal planning with weekly views. Stay tuned!"
      />
    </SafeAreaView>
  );
}
