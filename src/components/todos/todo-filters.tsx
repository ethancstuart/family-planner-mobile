import { ScrollView, Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "mine", label: "Mine" },
  { key: "overdue", label: "Overdue" },
  { key: "completed", label: "Completed" },
];

interface TodoFiltersProps {
  active: string;
  onChange: (filter: string) => void;
}

export function TodoFilters({ active, onChange }: TodoFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <Pressable
            key={f.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(f.key);
            }}
            className={`px-4 py-1.5 rounded-full ${
              isActive ? "bg-purple-600" : "border border-gray-300"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? "text-white" : "text-gray-600"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
