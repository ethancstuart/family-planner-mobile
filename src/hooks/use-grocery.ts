import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useHousehold } from "./use-household";
import { GROCERY_CATEGORIES } from "@/lib/constants";
import type { GroceryList, GroceryItem } from "@/types";

/** All grocery lists for the household, with item progress counts. */
export function useGroceryLists() {
  const { membership } = useHousehold();
  const householdId = membership?.household_id;

  return useQuery({
    queryKey: ["grocery-lists", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("*, grocery_items(*)")
        .eq("household_id", householdId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((list: any) => {
        const items: GroceryItem[] = list.grocery_items ?? [];
        return {
          ...list,
          grocery_items: undefined,
          totalItems: items.length,
          checkedItems: items.filter((i: GroceryItem) => i.checked).length,
        } as GroceryList & { totalItems: number; checkedItems: number };
      });
    },
    enabled: !!householdId,
  });
}

/** Single grocery list detail. */
export function useGroceryList(id: string | undefined) {
  return useQuery({
    queryKey: ["grocery-list", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as GroceryList;
    },
    enabled: !!id,
  });
}

/** Items for a grocery list, grouped by category in GROCERY_CATEGORIES order. */
export function useGroceryItems(listId: string | undefined) {
  return useQuery({
    queryKey: ["grocery-items", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grocery_items")
        .select("*")
        .eq("grocery_list_id", listId!);

      if (error) throw error;
      return (data ?? []) as GroceryItem[];
    },
    enabled: !!listId,
    select: (items) => {
      const unchecked = items.filter((i) => !i.checked);
      const checked = items.filter((i) => i.checked);

      // Group unchecked items by category
      const grouped = new Map<string, GroceryItem[]>();
      for (const item of unchecked) {
        const cat = item.category || "Other";
        if (!grouped.has(cat)) grouped.set(cat, []);
        grouped.get(cat)!.push(item);
      }

      // Sort categories in GROCERY_CATEGORIES order
      const sortedCategories = [...grouped.keys()].sort((a, b) => {
        const ai = GROCERY_CATEGORIES.indexOf(a as (typeof GROCERY_CATEGORIES)[number]);
        const bi = GROCERY_CATEGORIES.indexOf(b as (typeof GROCERY_CATEGORIES)[number]);
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      });

      return { items, unchecked, checked, grouped, sortedCategories };
    },
  });
}
