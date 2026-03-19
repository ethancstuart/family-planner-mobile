import { useState, useCallback } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { getWeekStartDate, parseDate, formatDate } from "@/lib/utils";
import { useMealPlan } from "@/hooks/use-meal-plan";
import {
  useAddMealSlot,
  useRemoveMealSlot,
  useSwapMealSlot,
  useCopyWeek,
  useSaveTemplate,
  useApplyTemplate,
  useDeleteTemplate,
} from "@/hooks/use-meal-plan-mutations";

import { WeekNavigator } from "@/components/meal-planner/week-navigator";
import { WeekView } from "@/components/meal-planner/week-view";
import { AddMealModal } from "@/components/meal-planner/add-meal-modal";
import { SaveTemplateModal } from "@/components/meal-planner/save-template-modal";
import { ApplyTemplateModal } from "@/components/meal-planner/apply-template-modal";
import { EmptyMealPlan } from "@/components/meal-planner/empty-meal-plan";
import { showMealActionsMenu } from "@/components/meal-planner/meal-actions-menu";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

import type { MealPlanSlot, MealType, DayOfWeek } from "@/types";

export default function MealsScreen() {
  // ── Week navigation state ───────────────────────────────────────
  const [weekStart, setWeekStart] = useState(() => getWeekStartDate());
  const isCurrentWeek = weekStart === getWeekStartDate();

  const goToWeek = useCallback((offset: number) => {
    setWeekStart((prev) => {
      const d = parseDate(prev);
      d.setDate(d.getDate() + offset * 7);
      return formatDate(d);
    });
  }, []);

  // ── Data ────────────────────────────────────────────────────────
  const { mealPlan, slots, recipes, isLoading, isError, error, refetch, isRefetching } =
    useMealPlan(weekStart);

  // ── Mutations ───────────────────────────────────────────────────
  const addSlot = useAddMealSlot();
  const removeSlot = useRemoveMealSlot();
  const swapSlot = useSwapMealSlot();
  const copyWeek = useCopyWeek();
  const saveTemplate = useSaveTemplate();
  const applyTemplate = useApplyTemplate();
  const deleteTemplate = useDeleteTemplate();

  // ── Modal state ─────────────────────────────────────────────────
  const [addMealModal, setAddMealModal] = useState<{
    visible: boolean;
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    swapSlotId?: string;
    currentRecipeId?: string;
  }>({ visible: false, dayOfWeek: 0 as DayOfWeek, mealType: "dinner" });

  const [saveTemplateVisible, setSaveTemplateVisible] = useState(false);
  const [applyTemplateVisible, setApplyTemplateVisible] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────
  const handleAddMeal = useCallback((dayOfWeek: DayOfWeek, mealType: MealType) => {
    setAddMealModal({ visible: true, dayOfWeek, mealType });
  }, []);

  const handleSwapMeal = useCallback((slot: MealPlanSlot) => {
    setAddMealModal({
      visible: true,
      dayOfWeek: slot.day_of_week as DayOfWeek,
      mealType: slot.meal_type as MealType,
      swapSlotId: slot.id,
      currentRecipeId: slot.recipe_id,
    });
  }, []);

  const handleSelectRecipe = useCallback(
    (recipeId: string) => {
      if (!mealPlan) return;

      if (addMealModal.swapSlotId) {
        swapSlot.mutate({
          slotId: addMealModal.swapSlotId,
          recipeId,
          mealPlanId: mealPlan.id,
        });
      } else {
        addSlot.mutate({
          mealPlanId: mealPlan.id,
          recipeId,
          dayOfWeek: addMealModal.dayOfWeek,
          mealType: addMealModal.mealType,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddMealModal((prev) => ({ ...prev, visible: false }));
    },
    [mealPlan, addMealModal, addSlot, swapSlot]
  );

  const handleRemoveMeal = useCallback(
    (slotId: string) => {
      if (!mealPlan) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      removeSlot.mutate({ slotId, mealPlanId: mealPlan.id });
    },
    [mealPlan, removeSlot]
  );

  const handleViewRecipe = useCallback((recipeId: string) => {
    router.push(`/(app)/(tabs)/recipes/${recipeId}`);
  }, []);

  const handleCopyLastWeek = useCallback(() => {
    if (!mealPlan) return;
    const prevWeekStart = (() => {
      const d = parseDate(weekStart);
      d.setDate(d.getDate() - 7);
      return formatDate(d);
    })();

    Alert.alert(
      "Copy Last Week",
      "Replace all meals this week with last week's meals?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy",
          onPress: () => {
            copyWeek.mutate(
              { targetMealPlanId: mealPlan.id, sourceWeekStart: prevWeekStart },
              {
                onSuccess: (data) => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  refetch();
                },
                onError: () => Alert.alert("Error", "Failed to copy last week's meals."),
              }
            );
          },
        },
      ]
    );
  }, [mealPlan, weekStart, copyWeek, refetch]);

  const handleSaveTemplate = useCallback(
    (name: string) => {
      if (!mealPlan) return;
      saveTemplate.mutate(
        { name, sourceMealPlanId: mealPlan.id },
        {
          onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSaveTemplateVisible(false);
          },
          onError: () => Alert.alert("Error", "Failed to save template."),
        }
      );
    },
    [mealPlan, saveTemplate]
  );

  const handleApplyTemplate = useCallback(
    (templateId: string) => {
      if (!mealPlan) return;
      applyTemplate.mutate(
        { templateId, targetMealPlanId: mealPlan.id },
        {
          onSuccess: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setApplyTemplateVisible(false);
            refetch();
          },
          onError: () => Alert.alert("Error", "Failed to apply template."),
        }
      );
    },
    [mealPlan, applyTemplate, refetch]
  );

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      deleteTemplate.mutate(
        { templateId },
        { onError: () => Alert.alert("Error", "Failed to delete template.") }
      );
    },
    [deleteTemplate]
  );

  const handleOpenMenu = useCallback(() => {
    showMealActionsMenu({
      onCopyLastWeek: handleCopyLastWeek,
      onSaveTemplate: () => setSaveTemplateVisible(true),
      onApplyTemplate: () => setApplyTemplateVisible(true),
    });
  }, [handleCopyLastWeek]);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pb-1">
        <Text className="text-2xl font-bold text-gray-900">Meal Planner</Text>
      </View>

      {/* Week Navigator */}
      <WeekNavigator
        weekStart={weekStart}
        isCurrentWeek={isCurrentWeek}
        onPrevWeek={() => goToWeek(-1)}
        onNextWeek={() => goToWeek(1)}
        onToday={() => setWeekStart(getWeekStartDate())}
        onOpenMenu={handleOpenMenu}
      />

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading meal plan..." />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <AlertCircle size={40} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-900 mt-3">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center mb-4">
            {error?.message ?? "Failed to load meal plan"}
          </Text>
          <Button title="Try Again" onPress={() => refetch()} variant="outline" />
        </View>
      ) : slots.length === 0 && recipes.length === 0 ? (
        <EmptyMealPlan />
      ) : (
        <WeekView
          weekStart={weekStart}
          slots={slots}
          isRefetching={isRefetching}
          onRefresh={refetch}
          onAddMeal={handleAddMeal}
          onViewRecipe={handleViewRecipe}
          onSwapMeal={handleSwapMeal}
          onRemoveMeal={handleRemoveMeal}
        />
      )}

      {/* Modals */}
      <AddMealModal
        visible={addMealModal.visible}
        onClose={() => setAddMealModal((prev) => ({ ...prev, visible: false }))}
        recipes={recipes}
        mealType={addMealModal.mealType}
        dayOfWeek={addMealModal.dayOfWeek}
        currentRecipeId={addMealModal.currentRecipeId}
        onSelectRecipe={handleSelectRecipe}
      />

      <SaveTemplateModal
        visible={saveTemplateVisible}
        onClose={() => setSaveTemplateVisible(false)}
        onSave={handleSaveTemplate}
        isSaving={saveTemplate.isPending}
      />

      <ApplyTemplateModal
        visible={applyTemplateVisible}
        onClose={() => setApplyTemplateVisible(false)}
        onApply={handleApplyTemplate}
        onDelete={handleDeleteTemplate}
        isApplying={applyTemplate.isPending}
      />
    </SafeAreaView>
  );
}
