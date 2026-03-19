import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { TodoList, TodoItem } from "@/types";

// ── Create a todo list ──────────────────────────────────────────────
export function useCreateTodoList() {
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
        .from("todo_lists")
        .insert({ household_id: householdId, title: title.trim() })
        .select()
        .single();

      if (error) throw error;
      return data as TodoList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
  });
}

// ── Delete a todo list ──────────────────────────────────────────────
export function useDeleteTodoList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId }: { listId: string }) => {
      await supabase.from("todo_items").delete().eq("todo_list_id", listId);
      const { error } = await supabase.from("todo_lists").delete().eq("id", listId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
  });
}

// ── Add a todo item ─────────────────────────────────────────────────
export function useAddTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listId,
      title,
      dueDate,
    }: {
      listId: string;
      title: string;
      dueDate: string | null;
    }) => {
      const { data, error } = await supabase
        .from("todo_items")
        .insert({
          todo_list_id: listId,
          title: title.trim().slice(0, 500),
          due_date: dueDate,
          assigned_to: null,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as TodoItem;
    },
    onMutate: async ({ listId, title, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ["todo-items", listId] });
      const previous = queryClient.getQueryData<TodoItem[]>(["todo-items", listId]);

      const optimistic: TodoItem = {
        id: `temp-${Date.now()}`,
        todo_list_id: listId,
        title: title.trim().slice(0, 500),
        due_date: dueDate,
        assigned_to: null,
        completed: false,
        is_recurring: false,
        recurrence_rule: null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<TodoItem[]>(
        ["todo-items", listId],
        (old = []) => [optimistic, ...old]
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
  });
}

// ── Toggle a todo item ──────────────────────────────────────────────
export function useToggleTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      completed,
    }: {
      itemId: string;
      completed: boolean;
      listId: string;
    }) => {
      const { error } = await supabase
        .from("todo_items")
        .update({ completed })
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, completed, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["todo-items", listId] });
      const previous = queryClient.getQueryData<TodoItem[]>(["todo-items", listId]);

      queryClient.setQueryData<TodoItem[]>(
        ["todo-items", listId],
        (old = []) => old.map((i) => (i.id === itemId ? { ...i, completed } : i))
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
  });
}

// ── Assign a todo item ──────────────────────────────────────────────
export function useAssignTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      assignedTo,
    }: {
      itemId: string;
      assignedTo: string | null;
      listId: string;
    }) => {
      const { error } = await supabase
        .from("todo_items")
        .update({ assigned_to: assignedTo })
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, assignedTo, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["todo-items", listId] });
      const previous = queryClient.getQueryData<TodoItem[]>(["todo-items", listId]);

      queryClient.setQueryData<TodoItem[]>(
        ["todo-items", listId],
        (old = []) =>
          old.map((i) => (i.id === itemId ? { ...i, assigned_to: assignedTo } : i))
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-items", vars.listId] });
    },
  });
}

// ── Delete a todo item ──────────────────────────────────────────────
export function useDeleteTodoItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId }: { itemId: string; listId: string }) => {
      const { error } = await supabase
        .from("todo_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, listId }) => {
      await queryClient.cancelQueries({ queryKey: ["todo-items", listId] });
      const previous = queryClient.getQueryData<TodoItem[]>(["todo-items", listId]);

      queryClient.setQueryData<TodoItem[]>(
        ["todo-items", listId],
        (old = []) => old.filter((i) => i.id !== itemId)
      );

      return { previous, listId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["todo-items", context.listId], context.previous);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todo-items", vars.listId] });
      queryClient.invalidateQueries({ queryKey: ["todo-lists"] });
    },
  });
}
