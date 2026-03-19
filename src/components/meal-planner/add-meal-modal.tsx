import { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
} from "react-native";
import { Search, X, Clock, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { MEAL_TYPE_LABELS, DAYS_OF_WEEK } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { Recipe, MealType, DayOfWeek } from "@/types";

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  recipes: Recipe[];
  mealType: MealType;
  dayOfWeek: DayOfWeek;
  /** If set, we're swapping — this recipe is disabled in the list. */
  currentRecipeId?: string;
  onSelectRecipe: (recipeId: string) => void;
}

export function AddMealModal({
  visible,
  onClose,
  recipes,
  mealType,
  dayOfWeek,
  currentRecipeId,
  onSelectRecipe,
}: AddMealModalProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const inputRef = useRef<TextInput>(null);

  // Reset search when modal opens
  useEffect(() => {
    if (visible) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  const filtered = useMemo(() => {
    if (!deferredSearch.trim()) return recipes;
    const q = deferredSearch.toLowerCase();
    return recipes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [recipes, deferredSearch]);

  const title = currentRecipeId
    ? `Swap ${MEAL_TYPE_LABELS[mealType]}`
    : `Add ${MEAL_TYPE_LABELS[mealType]}`;

  const dayName = DAYS_OF_WEEK[dayOfWeek];

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const isCurrent = item.id === currentRecipeId;
    const totalTime = (item.prep_time_minutes ?? 0) + (item.cook_time_minutes ?? 0);

    return (
      <Pressable
        onPress={() => {
          if (isCurrent) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSelectRecipe(item.id);
        }}
        className={`px-4 py-3 border-b border-gray-100 ${isCurrent ? "opacity-40" : "active:bg-gray-50"}`}
        disabled={isCurrent}
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
                {item.title}
              </Text>
              {isCurrent && (
                <Text className="text-xs text-gray-400">(current)</Text>
              )}
            </View>

            <View className="flex-row items-center mt-1 gap-3">
              {totalTime > 0 && (
                <View className="flex-row items-center gap-1">
                  <Clock size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-500">{totalTime} min</Text>
                </View>
              )}
              {item.servings && (
                <View className="flex-row items-center gap-1">
                  <Users size={12} color="#9ca3af" />
                  <Text className="text-xs text-gray-500">{item.servings}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Tags (max 3) */}
          <View className="flex-row gap-1">
            {item.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <View>
            <Text className="text-xl font-bold text-gray-900">{title}</Text>
            <Text className="text-sm text-gray-500">{dayName}</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="px-4 pb-3">
          <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2">
            <Search size={18} color="#9ca3af" />
            <TextInput
              ref={inputRef}
              className="flex-1 ml-2 text-base text-gray-900"
              placeholder="Search recipes..."
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <X size={18} color="#9ca3af" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Recipe list */}
        <FlatList
          data={filtered}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View className="items-center py-12 px-8">
              <Text className="text-base text-gray-500">
                {search ? "No recipes match your search" : "No recipes yet"}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}
