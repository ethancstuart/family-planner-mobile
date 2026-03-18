import { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  ChefHat,
  ExternalLink,
  Trash2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import {
  useRecipe,
  useToggleFavorite,
  useDeleteRecipe,
} from "@/hooks/use-recipes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { CookMode } from "@/components/cook-mode";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: recipe, isLoading } = useRecipe(id);
  const toggleFavorite = useToggleFavorite();
  const deleteRecipe = useDeleteRecipe();
  const [cookMode, setCookMode] = useState(false);

  if (isLoading || !recipe) {
    return <Loading fullScreen message="Loading recipe..." />;
  }

  if (cookMode) {
    return <CookMode recipe={recipe} onClose={() => setCookMode(false)} />;
  }

  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite.mutate({
      id: recipe.id,
      is_favorite: !recipe.is_favorite,
    });
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteRecipe.mutate(recipe.id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image or placeholder */}
        {recipe.image_url ? (
          <Image
            source={{ uri: recipe.image_url }}
            style={{ width: "100%", height: 280 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="w-full items-center justify-center bg-primary-50" style={{ height: 200 }}>
            <ChefHat size={48} color="#7c3aed" />
          </View>
        )}

        {/* Back button overlay */}
        <SafeAreaView
          className="absolute top-0 left-0 right-0"
          edges={["top"]}
        >
          <View className="flex-row items-center justify-between px-4 pt-2">
            <Pressable
              onPress={() => router.back()}
              className="bg-white/80 rounded-full p-2"
            >
              <ArrowLeft size={22} color="#111827" />
            </Pressable>
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleDelete}
                className="bg-white/80 rounded-full p-2"
              >
                <Trash2 size={22} color="#6b7280" />
              </Pressable>
              <Pressable
                onPress={handleToggleFavorite}
                className="bg-white/80 rounded-full p-2"
              >
                <Heart
                  size={22}
                  color={recipe.is_favorite ? "#ef4444" : "#6b7280"}
                  fill={recipe.is_favorite ? "#ef4444" : "transparent"}
                />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        <View className="px-5 pt-5 pb-12">
          {/* Title & meta */}
          <Text className="text-2xl font-bold text-gray-900">
            {recipe.title}
          </Text>

          {recipe.description && (
            <Text className="text-base text-gray-500 mt-2 leading-6">
              {recipe.description}
            </Text>
          )}

          {/* Stats row */}
          <View className="flex-row mt-4 gap-4">
            {totalTime > 0 && (
              <View className="flex-row items-center">
                <Clock size={16} color="#7c3aed" />
                <Text className="text-sm text-gray-700 ml-1.5">
                  {totalTime} min
                </Text>
              </View>
            )}
            {recipe.servings && (
              <View className="flex-row items-center">
                <Users size={16} color="#7c3aed" />
                <Text className="text-sm text-gray-700 ml-1.5">
                  {recipe.servings} servings
                </Text>
              </View>
            )}
            {recipe.source_url && (
              <Pressable
                onPress={() => Linking.openURL(recipe.source_url!)}
                className="flex-row items-center"
              >
                <ExternalLink size={16} color="#7c3aed" />
                <Text className="text-sm text-primary-600 ml-1.5">Source</Text>
              </Pressable>
            )}
          </View>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <View className="flex-row flex-wrap mt-3 gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} label={tag} variant="primary" />
              ))}
            </View>
          )}

          {/* Cook Mode CTA */}
          {recipe.steps.length > 0 && (
            <View className="mt-6">
              <Button
                title="Start Cook Mode"
                onPress={() => setCookMode(true)}
                size="lg"
                icon={<ChefHat size={20} color="#fff" />}
              />
            </View>
          )}

          {/* Ingredients */}
          <View className="mt-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              Ingredients
            </Text>
            {recipe.ingredients.map((ing, i) => (
              <View
                key={i}
                className="flex-row py-2.5 border-b border-gray-100"
              >
                <Text className="text-base text-gray-500 w-28">
                  {ing.quantity
                    ? `${ing.quantity}${ing.unit ? ` ${ing.unit}` : ""}`
                    : ""}
                </Text>
                <Text className="text-base text-gray-900 flex-1">
                  {ing.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          {recipe.steps.length > 0 && (
            <View className="mt-8">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Instructions
              </Text>
              {recipe.steps.map((step, i) => (
                <View key={i} className="flex-row mb-4">
                  <View className="bg-primary-100 rounded-full w-7 h-7 items-center justify-center mr-3 mt-0.5">
                    <Text className="text-sm font-bold text-primary-700">
                      {i + 1}
                    </Text>
                  </View>
                  <Text className="text-base text-gray-800 flex-1 leading-6">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
