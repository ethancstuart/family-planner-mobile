import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { GroceryItemRow } from "./grocery-item-row";
import type { GroceryItem } from "@/types";

interface ShoppingModeProps {
  title: string;
  items: GroceryItem[];
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
  onExit: () => void;
}

export function ShoppingMode({
  title,
  items,
  onToggle,
  onDelete,
  onExit,
}: ShoppingModeProps) {
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const progress = items.length > 0 ? checked.length / items.length : 0;

  const sections = [
    ...unchecked.map((item) => ({ type: "item" as const, item, dimmed: false })),
    ...(checked.length > 0
      ? [{ type: "header" as const, item: null as any, dimmed: true }]
      : []),
    ...checked.map((item) => ({ type: "item" as const, item, dimmed: true })),
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          <Pressable
            onPress={onExit}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>
        {/* Progress bar */}
        <View className="mt-2 flex-row items-center gap-3">
          <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-xs font-medium text-gray-500">
            {checked.length}/{items.length}
          </Text>
        </View>
      </View>

      {/* Items — flat list, no categories */}
      <FlatList
        data={sections}
        keyExtractor={(row, i) =>
          row.type === "header" ? "checked-header" : row.item.id
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item: row }) => {
          if (row.type === "header") {
            return (
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-4 mb-2 px-1">
                Done ({checked.length})
              </Text>
            );
          }

          return (
            <View className={`mb-2 ${row.dimmed ? "opacity-60" : ""}`}>
              <GroceryItemRow
                item={row.item}
                onToggle={onToggle}
                onDelete={onDelete}
                large
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
