import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ShoppingCart, CalendarDays, X, ChevronLeft } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface MealPlanOption {
  id: string;
  week_start_date: string;
}

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  mealPlans: MealPlanOption[];
  onCreateBlank: (title: string) => void;
  onGenerate: (mealPlanId: string) => void;
  isCreating: boolean;
}

type Mode = "choose" | "blank" | "generate";

export function CreateListModal({
  visible,
  onClose,
  mealPlans,
  onCreateBlank,
  onGenerate,
  isCreating,
}: CreateListModalProps) {
  const [mode, setMode] = useState<Mode>("choose");
  const [title, setTitle] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setMode("choose");
      setTitle("");
    }
  }, [visible]);

  useEffect(() => {
    if (mode === "blank") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [mode]);

  const handleCreateBlank = () => {
    if (!title.trim() || isCreating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreateBlank(title.trim());
  };

  const handleGenerate = (mealPlanId: string) => {
    if (isCreating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGenerate(mealPlanId);
  };

  const formatWeekLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return `Week of ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
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
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <View className="flex-row items-center gap-2">
            {mode !== "choose" && (
              <Pressable
                onPress={() => setMode("choose")}
                className="p-1 rounded-full active:bg-gray-100"
                hitSlop={8}
              >
                <ChevronLeft size={22} color="#374151" />
              </Pressable>
            )}
            <Text className="text-xl font-bold text-gray-900">
              New Grocery List
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        <Text className="px-4 text-sm text-gray-500 mb-4">
          {mode === "choose"
            ? "Start from scratch or generate from a meal plan."
            : mode === "blank"
              ? "Give your list a name."
              : "Pick a meal plan to generate items from."}
        </Text>

        {/* Step 1: Choose mode */}
        {mode === "choose" && (
          <View className="px-4 gap-3">
            <Pressable
              onPress={() => setMode("blank")}
              className="flex-row items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 active:bg-gray-50"
            >
              <View className="w-12 h-12 rounded-xl bg-purple-50 items-center justify-center">
                <ShoppingCart size={24} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Blank List
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Add items manually
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setMode("generate")}
              disabled={mealPlans.length === 0}
              className={`flex-row items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 active:bg-gray-50 ${
                mealPlans.length === 0 ? "opacity-50" : ""
              }`}
            >
              <View className="w-12 h-12 rounded-xl bg-teal-50 items-center justify-center">
                <CalendarDays size={24} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  From Meal Plan
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {mealPlans.length === 0
                    ? "No meal plans yet"
                    : "Auto-merge ingredients"}
                </Text>
              </View>
            </Pressable>
          </View>
        )}

        {/* Step 2a: Blank — enter title */}
        {mode === "blank" && (
          <View className="px-4 gap-4">
            <View className="bg-white rounded-xl border border-gray-200 px-3 py-2.5">
              <TextInput
                ref={inputRef}
                className="text-base text-gray-900"
                placeholder="e.g., Weekly groceries"
                placeholderTextColor="#9ca3af"
                value={title}
                onChangeText={setTitle}
                onSubmitEditing={handleCreateBlank}
                returnKeyType="done"
                autoCapitalize="sentences"
              />
            </View>
            <Pressable
              onPress={handleCreateBlank}
              disabled={!title.trim() || isCreating}
              className={`rounded-xl py-3 items-center ${
                title.trim() && !isCreating
                  ? "bg-purple-600 active:bg-purple-700"
                  : "bg-gray-200"
              }`}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  className={`text-base font-semibold ${
                    title.trim() ? "text-white" : "text-gray-400"
                  }`}
                >
                  Create List
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Step 2b: Generate — pick meal plan */}
        {mode === "generate" && (
          <View className="flex-1 px-4">
            {isCreating ? (
              <View className="items-center py-12 gap-3">
                <ActivityIndicator size="large" color="#7c3aed" />
                <Text className="text-sm text-gray-500">
                  Generating grocery list...
                </Text>
              </View>
            ) : (
              <FlatList
                data={mealPlans}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleGenerate(item.id)}
                    className="flex-row items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 mb-2 active:bg-gray-50"
                  >
                    <CalendarDays size={18} color="#6b7280" />
                    <Text className="text-sm font-medium text-gray-900">
                      {formatWeekLabel(item.week_start_date)}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <View className="items-center py-12">
                    <Text className="text-sm text-gray-500">
                      No meal plans found
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}
