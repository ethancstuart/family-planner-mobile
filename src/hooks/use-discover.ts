import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface SpoonacularSearchResult {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface SearchResponse {
  results: SpoonacularSearchResult[];
  totalResults: number;
}

/** Search Spoonacular recipes via web API proxy. */
export function useDiscoverRecipes(
  query: string,
  cuisine: string | null,
  diet: string | null,
  offset: number
) {
  return useQuery({
    queryKey: ["discover", query, cuisine, diet, offset],
    queryFn: async () => {
      return apiFetch<SearchResponse>("/api/recipes/spoonacular/search", {
        method: "POST",
        body: JSON.stringify({
          query,
          cuisine: cuisine || undefined,
          diet: diet || undefined,
          offset,
        }),
      });
    },
    enabled: !!query.trim(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Save a discovered Spoonacular recipe to the vault. */
export function useSaveDiscoveredRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spoonacularId }: { spoonacularId: number }) => {
      if (!Number.isInteger(spoonacularId) || spoonacularId <= 0) {
        throw new Error("Invalid recipe ID");
      }
      return apiFetch<{ recipe: { id: string } }>(
        `/api/recipes/spoonacular/${spoonacularId}`,
        { method: "POST" }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export type { SpoonacularSearchResult };
