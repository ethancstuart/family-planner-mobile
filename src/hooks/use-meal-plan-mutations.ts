import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import type { MealPlanSlot, MealType, DayOfWeek } from "@/types";

// ── Add a meal to a slot ────────────────────────────────────────────
export function useAddMealSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mealPlanId,
      recipeId,
      dayOfWeek,
      mealType,
    }: {
      mealPlanId: string;
      recipeId: string;
      dayOfWeek: DayOfWeek;
      mealType: MealType;
    }) => {
      const { data, error } = await supabase
        .from("meal_plan_slots")
        .insert({
          meal_plan_id: mealPlanId,
          recipe_id: recipeId,
          day_of_week: dayOfWeek,
          meal_type: mealType,
        })
        .select("*, recipe:recipes(*)")
        .single();

      if (error) throw error;
      return data as MealPlanSlot;
    },
    onMutate: async ({ mealPlanId, recipeId, dayOfWeek, mealType }) => {
      await queryClient.cancelQueries({ queryKey: ["meal-plan-slots", mealPlanId] });

      const previous = queryClient.getQueryData<MealPlanSlot[]>(["meal-plan-slots", mealPlanId]);

      // Optimistic append with a temporary slot
      queryClient.setQueryData<MealPlanSlot[]>(
        ["meal-plan-slots", mealPlanId],
        (old = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            meal_plan_id: mealPlanId,
            recipe_id: recipeId,
            day_of_week: dayOfWeek,
            meal_type: mealType,
          } as MealPlanSlot,
        ]
      );

      return { previous, mealPlanId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["meal-plan-slots", context.mealPlanId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-slots", vars.mealPlanId] });
    },
  });
}

// ── Remove a meal from a slot ───────────────────────────────────────
export function useRemoveMealSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slotId }: { slotId: string; mealPlanId: string }) => {
      const { error } = await supabase.from("meal_plan_slots").delete().eq("id", slotId);
      if (error) throw error;
    },
    onMutate: async ({ slotId, mealPlanId }) => {
      await queryClient.cancelQueries({ queryKey: ["meal-plan-slots", mealPlanId] });

      const previous = queryClient.getQueryData<MealPlanSlot[]>(["meal-plan-slots", mealPlanId]);

      queryClient.setQueryData<MealPlanSlot[]>(
        ["meal-plan-slots", mealPlanId],
        (old = []) => old.filter((s) => s.id !== slotId)
      );

      return { previous, mealPlanId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["meal-plan-slots", context.mealPlanId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-slots", vars.mealPlanId] });
    },
  });
}

// ── Swap recipe on an existing slot ─────────────────────────────────
export function useSwapMealSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slotId, recipeId }: { slotId: string; recipeId: string; mealPlanId: string }) => {
      const { data, error } = await supabase
        .from("meal_plan_slots")
        .update({ recipe_id: recipeId })
        .eq("id", slotId)
        .select("*, recipe:recipes(*)")
        .single();

      if (error) throw error;
      return data as MealPlanSlot;
    },
    onMutate: async ({ slotId, recipeId, mealPlanId }) => {
      await queryClient.cancelQueries({ queryKey: ["meal-plan-slots", mealPlanId] });

      const previous = queryClient.getQueryData<MealPlanSlot[]>(["meal-plan-slots", mealPlanId]);

      queryClient.setQueryData<MealPlanSlot[]>(
        ["meal-plan-slots", mealPlanId],
        (old = []) =>
          old.map((s) => (s.id === slotId ? { ...s, recipe_id: recipeId } : s))
      );

      return { previous, mealPlanId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["meal-plan-slots", context.mealPlanId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-slots", vars.mealPlanId] });
    },
  });
}

// ── Copy last week's meals ──────────────────────────────────────────
export function useCopyWeek() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetMealPlanId,
      sourceWeekStart,
    }: {
      targetMealPlanId: string;
      sourceWeekStart: string;
    }) => {
      return apiFetch<{ copied: number }>("/api/meal-planner/copy-week", {
        method: "POST",
        body: JSON.stringify({ targetMealPlanId, sourceWeekStart }),
      });
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-slots"] });
    },
  });
}

// ── Save current week as template ───────────────────────────────────
export function useSaveTemplate() {
  return useMutation({
    mutationFn: async ({
      name,
      sourceMealPlanId,
    }: {
      name: string;
      sourceMealPlanId: string;
    }) => {
      return apiFetch<{ template: { id: string; name: string } }>("/api/meal-planner/templates", {
        method: "POST",
        body: JSON.stringify({ name, sourceMealPlanId }),
      });
    },
  });
}

// ── Apply a template to the current week ────────────────────────────
export function useApplyTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      targetMealPlanId,
    }: {
      templateId: string;
      targetMealPlanId: string;
    }) => {
      return apiFetch<{ applied: number }>("/api/meal-planner/templates/apply", {
        method: "POST",
        body: JSON.stringify({ templateId, targetMealPlanId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan-slots"] });
    },
  });
}

// ── Delete a template ───────────────────────────────────────────────
export function useDeleteTemplate() {
  return useMutation({
    mutationFn: async ({ templateId }: { templateId: string }) => {
      return apiFetch("/api/meal-planner/templates", {
        method: "DELETE",
        body: JSON.stringify({ templateId }),
      });
    },
  });
}
