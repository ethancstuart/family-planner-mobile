import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useHousehold } from "./use-household";
import { getWeekStartDate } from "@/lib/utils";
import type { MealPlan, MealPlanSlot, Recipe } from "@/types";

/**
 * Fetches (or auto-creates) the meal plan for a given week,
 * its slots with joined recipes, and all household recipes for the picker.
 */
export function useMealPlan(weekStart: string) {
  const { membership } = useHousehold();
  const householdId = membership?.household_id;

  // Query 1: Fetch or create meal plan for this week
  const mealPlanQuery = useQuery({
    queryKey: ["meal-plan", householdId, weekStart],
    queryFn: async () => {
      // Try to find existing plan
      const { data: existing, error: fetchError } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("household_id", householdId!)
        .eq("week_start_date", weekStart)
        .limit(1)
        .single();

      if (existing) return existing as MealPlan;

      // Not found — create one
      if (fetchError?.code === "PGRST116") {
        const { data: created, error: createError } = await supabase
          .from("meal_plans")
          .insert({ household_id: householdId!, week_start_date: weekStart })
          .select()
          .single();

        if (createError) throw createError;
        return created as MealPlan;
      }

      if (fetchError) throw fetchError;
      return existing as MealPlan;
    },
    enabled: !!householdId,
  });

  const mealPlanId = mealPlanQuery.data?.id;

  // Query 2: Fetch slots with joined recipes
  const slotsQuery = useQuery({
    queryKey: ["meal-plan-slots", mealPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meal_plan_slots")
        .select("*, recipe:recipes(*)")
        .eq("meal_plan_id", mealPlanId!);

      if (error) throw error;
      return (data ?? []) as MealPlanSlot[];
    },
    enabled: !!mealPlanId,
  });

  // Query 3: All household recipes for the picker
  const recipesQuery = useQuery({
    queryKey: ["household-recipes", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("household_id", householdId!)
        .order("title", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Recipe[];
    },
    enabled: !!householdId,
  });

  return {
    mealPlan: mealPlanQuery.data ?? null,
    slots: slotsQuery.data ?? [],
    recipes: recipesQuery.data ?? [],
    isLoading: mealPlanQuery.isLoading || slotsQuery.isLoading,
    isError: mealPlanQuery.isError || slotsQuery.isError,
    error: mealPlanQuery.error || slotsQuery.error,
    refetch: async () => {
      await mealPlanQuery.refetch();
      await slotsQuery.refetch();
    },
    isRefetching: mealPlanQuery.isRefetching || slotsQuery.isRefetching,
  };
}
