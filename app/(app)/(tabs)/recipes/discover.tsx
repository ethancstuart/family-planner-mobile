import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Search, X, Key } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useRecipes } from "@/hooks/use-recipes";
import {
  useDiscoverRecipes,
  useSaveDiscoveredRecipe,
} from "@/hooks/use-discover";
import { DiscoverCard } from "@/components/discover-card";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

const CUISINES = ["Italian", "Mexican", "Asian", "American", "Mediterranean"];
const DIETS = ["Vegetarian", "Vegan", "Gluten Free"];

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    debounceTimer.current = setTimeout(
      () => {
        setDebouncedSearch(search);
        setOffset(0);
        setAllResults([]);
      },
      300
    );
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Reset on filter change
  useEffect(() => {
    setOffset(0);
    setAllResults([]);
  }, [cuisine, diet]);

  const { data, isLoading, isError } = useDiscoverRecipes(
    debouncedSearch,
    cuisine,
    diet,
    offset
  );

  // Get existing recipes to check for already-saved
  const { data: existingRecipes } = useRecipes("");
  const existingSpoonacularIds = useMemo(() => {
    const ids = new Set<number>();
    for (const page of existingRecipes?.pages ?? []) {
      for (const r of page) {
        if (r.spoonacular_id) ids.add(r.spoonacular_id);
      }
    }
    return ids;
  }, [existingRecipes]);

  // Append new results
  useEffect(() => {
    if (data?.results) {
      if (offset === 0) {
        setAllResults(data.results);
      } else {
        setAllResults((prev) => [...prev, ...data.results]);
      }
    }
  }, [data, offset]);

  const saveRecipe = useSaveDiscoveredRecipe();

  const handleSave = useCallback(
    (spoonacularId: number) => {
      setSavingIds((prev) => new Set([...prev, spoonacularId]));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      saveRecipe.mutate(
        { spoonacularId },
        {
          onSuccess: () => {
            setSavingIds((prev) => {
              const next = new Set(prev);
              next.delete(spoonacularId);
              return next;
            });
            setSavedIds((prev) => new Set([...prev, spoonacularId]));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          onError: (err) => {
            setSavingIds((prev) => {
              const next = new Set(prev);
              next.delete(spoonacularId);
              return next;
            });
            Alert.alert("Error", err.message || "Failed to save recipe.");
          },
        }
      );
    },
    [saveRecipe]
  );

  const handleLoadMore = useCallback(() => {
    if (data && allResults.length < data.totalResults) {
      setOffset((prev) => prev + 12);
    }
  }, [data, allResults.length]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <DiscoverCard
        result={item}
        isSaved={savedIds.has(item.id) || existingSpoonacularIds.has(item.id)}
        isSaving={savingIds.has(item.id)}
        onSave={() => handleSave(item.id)}
      />
    ),
    [savedIds, existingSpoonacularIds, savingIds, handleSave]
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-4 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3">
          Discover Recipes
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 mb-3">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2">
          <Search size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-900"
            placeholder="Search recipes..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoFocus
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <X size={18} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
      >
        {CUISINES.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCuisine(cuisine === c ? null : c);
            }}
            className={`px-3 py-1.5 rounded-full ${
              cuisine === c ? "bg-purple-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                cuisine === c ? "text-white" : "text-gray-600"
              }`}
            >
              {c}
            </Text>
          </Pressable>
        ))}
        <View className="w-px bg-gray-200 mx-1 my-1" />
        {DIETS.map((d) => (
          <Pressable
            key={d}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDiet(diet === d ? null : d);
            }}
            className={`px-3 py-1.5 rounded-full ${
              diet === d ? "bg-purple-600" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                diet === d ? "text-white" : "text-gray-600"
              }`}
            >
              {d}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results */}
      {isLoading && offset === 0 ? (
        <Loading message="Searching..." />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Key size={40} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-900 mt-3">
            Search failed
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center mb-4">
            Make sure your Spoonacular API key is configured in Settings.
          </Text>
          <Button
            title="Go to Settings"
            onPress={() => router.push("/(app)/(tabs)/settings")}
            variant="outline"
          />
        </View>
      ) : allResults.length > 0 ? (
        <FlatList
          data={allResults}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={8}
          ListHeaderComponent={
            data?.totalResults ? (
              <Text className="text-sm text-gray-500 mb-3">
                {data.totalResults} results found
              </Text>
            ) : null
          }
        />
      ) : debouncedSearch.trim() ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-base text-gray-500">
            No recipes found for "{debouncedSearch}"
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Search size={40} color="#d1d5db" />
          <Text className="text-base text-gray-500 mt-3 text-center">
            Search for recipes from around the world
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
