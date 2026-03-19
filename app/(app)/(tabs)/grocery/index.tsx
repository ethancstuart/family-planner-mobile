import { useState, useCallback } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { supabase } from "@/lib/supabase";
import { useHousehold } from "@/hooks/use-household";
import { useGroceryLists } from "@/hooks/use-grocery";
import {
  useCreateBlankList,
  useGenerateGroceryList,
} from "@/hooks/use-grocery-mutations";

import { GroceryListCard } from "@/components/grocery/grocery-list-card";
import { CreateListModal } from "@/components/grocery/create-list-modal";
import { EmptyGrocery } from "@/components/grocery/empty-grocery";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";


export default function GroceryScreen() {
  const { membership } = useHousehold();
  const householdId = membership?.household_id;

  const { data: lists, isLoading, isError, error, refetch, isRefetching } =
    useGroceryLists();

  const createBlank = useCreateBlankList();
  const generate = useGenerateGroceryList();

  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Fetch meal plans for the "From Meal Plan" flow
  const [mealPlans, setMealPlans] = useState<
    { id: string; week_start_date: string }[]
  >([]);

  const openCreateModal = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Fetch recent meal plans inline (lightweight — no hook needed)
    if (householdId) {
      const { data } = await supabase
        .from("meal_plans")
        .select("id, week_start_date")
        .eq("household_id", householdId)
        .order("week_start_date", { ascending: false })
        .limit(12);

      setMealPlans(data ?? []);
    }

    setCreateModalVisible(true);
  }, [householdId]);

  const handleCreateBlank = useCallback(
    (title: string) => {
      if (!householdId) return;
      createBlank.mutate(
        { householdId, title },
        {
          onSuccess: (list) => {
            setCreateModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push(`/(app)/(tabs)/grocery/${list.id}`);
          },
          onError: () => Alert.alert("Error", "Failed to create list."),
        }
      );
    },
    [householdId, createBlank]
  );

  const handleGenerate = useCallback(
    (mealPlanId: string) => {
      generate.mutate(
        { mealPlanId },
        {
          onSuccess: (data) => {
            setCreateModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.push(`/(app)/(tabs)/grocery/${data.grocery_list.id}`);
          },
          onError: (err) =>
            Alert.alert("Error", err.message || "Failed to generate list."),
        }
      );
    },
    [generate]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Grocery Lists</Text>
        {(lists?.length ?? 0) > 0 && (
          <Button
            title="New List"
            onPress={openCreateModal}
            size="sm"
            icon={<Plus size={16} color="#fff" />}
          />
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading lists..." />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <AlertCircle size={40} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-900 mt-3">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center mb-4">
            {error?.message ?? "Failed to load grocery lists"}
          </Text>
          <Button title="Try Again" onPress={() => refetch()} variant="outline" />
        </View>
      ) : !lists || lists.length === 0 ? (
        <EmptyGrocery onCreateList={openCreateModal} />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GroceryListCard
              list={item}
              onPress={() => router.push(`/(app)/(tabs)/grocery/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}

      {/* Create List Modal */}
      <CreateListModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        mealPlans={mealPlans}
        onCreateBlank={handleCreateBlank}
        onGenerate={handleGenerate}
        isCreating={createBlank.isPending || generate.isPending}
      />
    </SafeAreaView>
  );
}
