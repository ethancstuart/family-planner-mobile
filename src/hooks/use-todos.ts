import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useHousehold } from "./use-household";
import type { TodoList, TodoItem } from "@/types";

/** All todo lists for the household, with item progress counts. */
export function useTodoLists() {
  const { membership } = useHousehold();
  const householdId = membership?.household_id;

  return useQuery({
    queryKey: ["todo-lists", householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todo_lists")
        .select("*, todo_items(id, completed)")
        .eq("household_id", householdId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((list: any) => {
        const items: { id: string; completed: boolean }[] = list.todo_items ?? [];
        return {
          ...list,
          todo_items: undefined,
          totalItems: items.length,
          completedItems: items.filter((i) => i.completed).length,
        } as TodoList & { totalItems: number; completedItems: number };
      });
    },
    enabled: !!householdId,
  });
}

/** All items for a specific todo list. */
export function useTodoItems(listId: string | undefined) {
  return useQuery({
    queryKey: ["todo-items", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todo_items")
        .select("*")
        .eq("todo_list_id", listId!)
        .order("completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as TodoItem[];
    },
    enabled: !!listId,
  });
}
