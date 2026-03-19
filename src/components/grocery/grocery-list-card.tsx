import { View, Text, Pressable } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import type { GroceryList } from "@/types";

interface GroceryListCardProps {
  list: GroceryList & { totalItems: number; checkedItems: number };
  onPress: () => void;
}

export function GroceryListCard({ list, onPress }: GroceryListCardProps) {
  const progress =
    list.totalItems > 0 ? list.checkedItems / list.totalItems : 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-gray-100 px-4 py-4 mb-3 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
          <ShoppingCart size={20} color="#7c3aed" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {list.title}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {list.totalItems === 0
              ? "No items"
              : `${list.checkedItems}/${list.totalItems} items`}
          </Text>
        </View>
      </View>

      {list.totalItems > 0 && (
        <View className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-purple-600 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      )}
    </Pressable>
  );
}
