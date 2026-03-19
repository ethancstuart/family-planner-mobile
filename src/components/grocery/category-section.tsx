import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronDown } from "lucide-react-native";

const categoryColors: Record<string, string> = {
  Produce: "#10b981",
  "Dairy & Eggs": "#f59e0b",
  "Meat & Seafood": "#f43f5e",
  Bakery: "#f97316",
  Pantry: "#ca8a04",
  Frozen: "#0ea5e9",
  Beverages: "#3b82f6",
  Snacks: "#8b5cf6",
  "Condiments & Sauces": "#d946ef",
  "Spices & Seasonings": "#14b8a6",
  "Canned Goods": "#94a3b8",
  "Grains & Pasta": "#d97706",
};

interface CategorySectionProps {
  category: string;
  children: React.ReactNode;
}

export function CategorySection({ category, children }: CategorySectionProps) {
  const [open, setOpen] = useState(true);
  const color = categoryColors[category] ?? "#9ca3af";

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setOpen(!open)}
        className="flex-row items-center gap-2 py-1 px-1"
      >
        <View
          className="w-1 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <ChevronDown
          size={14}
          color="#6b7280"
          style={{
            transform: [{ rotate: open ? "0deg" : "-90deg" }],
          }}
        />
        <Text className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {category}
        </Text>
      </Pressable>
      {open && <View className="mt-1.5 gap-1.5">{children}</View>}
    </View>
  );
}
