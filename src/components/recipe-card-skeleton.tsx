import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export function RecipeCardSkeleton() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={style}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3"
    >
      <View className="w-full h-40 bg-gray-200" />
      <View className="p-3">
        <View className="h-5 bg-gray-200 rounded-md w-3/4 mb-2" />
        <View className="h-4 bg-gray-100 rounded-md w-full mb-2" />
        <View className="flex-row gap-2">
          <View className="h-3 bg-gray-100 rounded-md w-16" />
          <View className="h-3 bg-gray-100 rounded-md w-12" />
        </View>
      </View>
    </Animated.View>
  );
}
