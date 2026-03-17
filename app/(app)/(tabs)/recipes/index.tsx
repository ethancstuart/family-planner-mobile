import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Plus, Search, X } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecipes, useToggleFavorite } from "@/hooks/use-recipes";
import { RecipeCard } from "@/components/recipe-card";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import type { Recipe } from "@/types";

export default function RecipeListScreen() {
  const [search, setSearch] = useState("");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const { data: recipes, isLoading, refetch } = useRecipes(search);
  const toggleFavorite = useToggleFavorite();
  const { width } = useWindowDimensions();

  // iPad: two-column layout
  const isTablet = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  const filteredRecipes = filterFavorites
    ? (recipes ?? []).filter((r) => r.is_favorite)
    : recipes ?? [];

  const handleRecipePress = useCallback((recipe: Recipe) => {
    router.push(`/(app)/(tabs)/recipes/${recipe.id}`);
  }, []);

  const handleToggleFavorite = useCallback(
    (recipe: Recipe) => {
      toggleFavorite.mutate({
        id: recipe.id,
        is_favorite: !recipe.is_favorite,
      });
    },
    [toggleFavorite]
  );

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => (
      <View style={isTablet ? { flex: 1, maxWidth: "50%", paddingHorizontal: 6 } : undefined}>
        <RecipeCard
          recipe={item}
          onPress={() => handleRecipePress(item)}
          onToggleFavorite={() => handleToggleFavorite(item)}
        />
      </View>
    ),
    [isTablet, handleRecipePress, handleToggleFavorite]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-gray-900">Recipes</Text>
          <Pressable
            onPress={() => router.push("/(app)/(tabs)/recipes/import")}
            className="bg-primary-700 rounded-full p-2.5 active:bg-primary-800"
          >
            <Plus size={20} color="#fff" />
          </Pressable>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Search size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search recipes..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <X size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <View className="flex-row mt-2 gap-2">
          <Pressable
            onPress={() => setFilterFavorites(false)}
            className={`px-3 py-1.5 rounded-full ${
              !filterFavorites ? "bg-primary-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                !filterFavorites ? "text-primary-700" : "text-gray-600"
              }`}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilterFavorites(true)}
            className={`px-3 py-1.5 rounded-full ${
              filterFavorites ? "bg-primary-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filterFavorites ? "text-primary-700" : "text-gray-600"
              }`}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Recipe list */}
      {isLoading ? (
        <Loading message="Loading recipes..." />
      ) : filteredRecipes.length === 0 ? (
        <EmptyState
          title={search ? "No recipes found" : "No recipes yet"}
          description={
            search
              ? "Try a different search term"
              : "Import your first recipe to get started"
          }
        />
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns} // force re-render when columns change
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#7c3aed"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
