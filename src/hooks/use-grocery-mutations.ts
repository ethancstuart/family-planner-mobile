import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { parseGroceryInput } from "@/lib/utils";
import { getCategoryForIngredient } from "@/lib/constants";
import type { GroceryItem, GroceryList } from "@/types";

// ── Create a blank grocery list ─────────────────────────────────────
export function useCreateBlankList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      householdId,
      title,
    }: {
      householdId: string;
      title: string;
    }) => {
      const { data, error } = await supabase
        .from("grocery_lists")
        .insert({ household_id: householdId, title: title.trim() })
        .select()
        .single();

      if (error) throw error;
      return data as GroceryList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}

// ── Generate grocery list from a meal plan ──────────────────────────
export function useGenerateGroceryList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mealPlanId }: { mealPlanId: string }) => {
      return apiFetch<{ grocery_list: GroceryList }>("/api/grocery/generate", {
        method: "POST",
        body: JSON.stringify({ meal_plan_id: mealPlanId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}

// ── Add item to a grocery list ──────────────────────────────────────
export function useAddGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      rawInput,
    }: {
      listId: string;
      rawInput: string;
    }) => {
      const parsed = parseGroceryInput(rawInput);
      const category = getCategoryForIngredient(parsed.name);

      const { data, error } = await supabase
        .from("grocery_items")
        .insert({
          grocery_list_id: listId,
          name: parsed.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          category,
          checked: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as GroceryItem;
    },
    onMutate: async ({ listId, rawInput }) => {
      await queryClient.cancelQueries({ queryKey: ["grocery-items", listId] });
      const previous = queryClient.getQueryData<GroceryItem[]>(["grocery-items", listId]);

      const parsed = parseGroceryInput(rawInput);
      const optimistic: GroceryItem = {
        id: `temp-${Date.now()}`,
        grocery_list_id: listId,
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        category: getCategoryForIngredient(parsed.name),
        checked: false,
      };

      queryClient.setQueryData<GroceryItem[]>(
        ["grocery-items", listId],
        (old = []) => [...old, optimistic]
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["grocery-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}

// ── Toggle item checked ─────────────────────────────────────────────
export function useToggleGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      checked,
    }: {
      itemId: string;
      checked: boolean;
      listId: string;
    }) => {
      const { error } = await supabase
        .from("grocery_items")
        .update({ checked })
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, checked, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["grocery-items", listId] });
      const previous = queryClient.getQueryData<GroceryItem[]>(["grocery-items", listId]);

      queryClient.setQueryData<GroceryItem[]>(
        ["grocery-items", listId],
        (old = []) => old.map((i) => (i.id === itemId ? { ...i, checked } : i))
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["grocery-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}

// ── Delete a single item ────────────────────────────────────────────
export function useDeleteGroceryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string; listId: string }) => {
      const { error } = await supabase
        .from("grocery_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["grocery-items", listId] });
      const previous = queryClient.getQueryData<GroceryItem[]>(["grocery-items", listId]);

      queryClient.setQueryData<GroceryItem[]>(
        ["grocery-items", listId],
        (old = []) => old.filter((i) => i.id !== itemId)
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["grocery-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}

// ── Delete an entire grocery list ───────────────────────────────────
export function useDeleteGroceryList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId }: { listId: string }) => {
      // Delete items first, then the list
      await supabase.from("grocery_items").delete().eq("grocery_list_id", listId);
      const { error } = await supabase.from("grocery_lists").delete().eq("id", listId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-lists"] });
    },
  });
}
