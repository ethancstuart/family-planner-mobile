import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShoppingCart } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";

export default function GroceryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Grocery Lists</Text>
      </View>
      <EmptyState
        icon={<ShoppingCart size={48} color="#d1d5db" />}
        title="Coming in v1.2"
        description="Auto-generate grocery lists from your meal plan. Stay tuned!"
      />
    </SafeAreaView>
  );
}
