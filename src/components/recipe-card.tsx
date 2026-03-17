import { Pressable, View, Text } from "react-native";
import { Image } from "expo-image";
import { Heart, Clock, ChefHat } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Badge } from "./ui/badge";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function RecipeCard({
  recipe,
  onPress,
  onToggleFavorite,
}: RecipeCardProps) {
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleFavorite();
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:opacity-90 mb-3"
    >
      {recipe.image_url ? (
        <Image
          source={{ uri: recipe.image_url }}
          style={{ width: "100%", height: 160 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className="w-full items-center justify-center bg-primary-50"
          style={{ height: 120 }}
        >
          <ChefHat size={36} color="#7c3aed" />
        </View>
      )}
      <View className="p-3">
        <View className="flex-row items-start justify-between">
          <Text
            className="text-base font-semibold text-gray-900 flex-1 mr-2"
            numberOfLines={2}
          >
            {recipe.title}
          </Text>
          <Pressable onPress={handleFavorite} hitSlop={8}>
            <Heart
              size={22}
              color={recipe.is_favorite ? "#ef4444" : "#d1d5db"}
              fill={recipe.is_favorite ? "#ef4444" : "transparent"}
            />
          </Pressable>
        </View>

        {recipe.description && (
          <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
            {recipe.description}
          </Text>
        )}

        <View className="flex-row items-center mt-2 gap-2">
          {totalTime > 0 && (
            <View className="flex-row items-center">
              <Clock size={14} color="#9ca3af" />
              <Text className="text-xs text-gray-500 ml-1">
                {totalTime} min
              </Text>
            </View>
          )}
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
