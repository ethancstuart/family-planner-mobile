import { memo } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Clock, Check, ChefHat } from "lucide-react-native";
import { Badge } from "./ui/badge";

interface SpoonacularResult {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface DiscoverCardProps {
  result: SpoonacularResult;
  isSaved: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const DiscoverCard = memo(function DiscoverCard({
  result,
  isSaved,
  isSaving,
  onSave,
}: DiscoverCardProps) {
  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3">
      {result.image ? (
        <Image
          source={{ uri: result.image }}
          style={{ width: "100%", height: 140 }}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          className="w-full items-center justify-center bg-primary-50"
          style={{ height: 100 }}
        >
          <ChefHat size={32} color="#7c3aed" />
        </View>
      )}

      <View className="p-3">
        <Text
          className="text-base font-semibold text-gray-900 mb-2"
          numberOfLines={2}
        >
          {result.title}
        </Text>

        <View className="flex-row items-center gap-2 mb-3 flex-wrap">
          {result.readyInMinutes && (
            <View className="flex-row items-center">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-xs text-gray-500 ml-1">
                {result.readyInMinutes} min
              </Text>
            </View>
          )}
          {result.vegetarian && <Badge label="Vegetarian" />}
          {result.vegan && <Badge label="Vegan" />}
          {result.glutenFree && <Badge label="GF" />}
        </View>

        {isSaved ? (
          <View className="flex-row items-center justify-center gap-1.5 bg-green-50 rounded-xl py-2">
            <Check size={16} color="#16a34a" />
            <Text className="text-sm font-medium text-green-700">Saved</Text>
          </View>
        ) : (
          <Pressable
            onPress={onSave}
            disabled={isSaving}
            className={`items-center rounded-xl py-2 ${
              isSaving ? "bg-gray-100" : "bg-purple-600 active:bg-purple-700"
            }`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#7c3aed" />
            ) : (
              <Text className="text-sm font-semibold text-white">
                Save to Vault
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
});
