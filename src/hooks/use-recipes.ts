import { useQuery, useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useHousehold } from "./use-household";
import type { Recipe } from "@/types";

const PAGE_SIZE = 20;

export function useRecipes(search?: string) {
  const { membership } = useHousehold();

  return useInfiniteQuery({
    queryKey: ["recipes", membership?.household_id, search],
    queryFn: async ({ pageParam = 0 }) => {
      if (!membership) return [];

      let query = supabase
        .from("recipes")
        .select("*")
        .eq("household_id", membership.household_id)
        .order("updated_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (search?.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Recipe[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.flat().length;
    },
    enabled: !!membership,
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    enabled: !!id,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_favorite,
    }: {
      id: string;
      is_favorite: boolean;
    }) => {
      const { error } = await supabase
        .from("recipes")
        .update({ is_favorite })
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async ({ id, is_favorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["recipes"] });
      await queryClient.cancelQueries({ queryKey: ["recipe", id] });

      // Snapshot previous values
      const previousRecipes = queryClient.getQueriesData<InfiniteData<Recipe[]>>({
        queryKey: ["recipes"],
      });
      const previousRecipe = queryClient.getQueryData<Recipe>(["recipe", id]);

      // Optimistically update recipe lists (infinite query pages)
      queryClient.setQueriesData<InfiniteData<Recipe[]>>(
        { queryKey: ["recipes"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((r) => (r.id === id ? { ...r, is_favorite } : r))
            ),
          };
        }
      );

      // Optimistically update single recipe
      if (previousRecipe) {
        queryClient.setQueryData<Recipe>(["recipe", id], {
          ...previousRecipe,
          is_favorite,
        });
      }

      return { previousRecipes, previousRecipe };
    },
    onError: (_err, { id }, context) => {
      // Rollback
      if (context?.previousRecipes) {
        for (const [key, data] of context.previousRecipes) {
          queryClient.setQueryData(key, data);
        }
      }
      if (context?.previousRecipe) {
        queryClient.setQueryData(["recipe", id], context.previousRecipe);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
