import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import {
  X,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import type { Recipe } from "@/types";

interface CookModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export function CookMode({ recipe, onClose }: CookModeProps) {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const totalSteps = recipe.steps.length;
  const isSingleStep = totalSteps <= 1;

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleDone = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }, [onClose]);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = width * 0.25;
      if (e.translationX < -threshold) {
        runOnJS(goNext)();
      } else if (e.translationX > threshold) {
        runOnJS(goPrev)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-3 bg-primary-700"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable onPress={onClose} hitSlop={12}>
          <X size={24} color="#fff" />
        </Pressable>
        <Text
          className="text-white font-semibold text-base flex-1 text-center mx-4"
          numberOfLines={1}
        >
          {recipe.title}
        </Text>
        <Pressable
          onPress={() => setShowIngredients(!showIngredients)}
          hitSlop={12}
        >
          <UtensilsCrossed size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Progress bar */}
      <View className="h-1 bg-gray-200">
        <View
          className="h-1 bg-primary-500"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
        />
      </View>

      {showIngredients ? (
        /* Ingredients panel */
        <ScrollView className="flex-1 px-6 pt-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Ingredients
          </Text>
          {recipe.ingredients.map((ing, i) => (
            <View key={i} className="flex-row py-2 border-b border-gray-100">
              <Text className="text-base text-gray-500 w-24">
                {ing.quantity ? `${ing.quantity} ${ing.unit ?? ""}` : ""}
              </Text>
              <Text className="text-base text-gray-900 flex-1">
                {ing.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Step view */
        <GestureDetector gesture={swipeGesture}>
          <Animated.View
            className="flex-1 justify-center px-8"
            style={animatedStyle}
          >
            <Text className="text-sm font-medium text-primary-600 mb-2">
              {isSingleStep
                ? "Instructions"
                : `Step ${currentStep + 1} of ${totalSteps}`}
            </Text>
            <Text className="text-2xl leading-9 text-gray-900 font-medium">
              {recipe.steps[currentStep]}
            </Text>
          </Animated.View>
        </GestureDetector>
      )}

      {/* Navigation */}
      {!showIngredients && (
        <View
          className="flex-row items-center justify-between px-6 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {isSingleStep ? (
            <View className="flex-1" />
          ) : (
            <Pressable
              onPress={goPrev}
              disabled={currentStep === 0}
              className={`flex-row items-center px-5 py-3 rounded-xl ${
                currentStep === 0
                  ? "opacity-30"
                  : "bg-gray-100 active:bg-gray-200"
              }`}
            >
              <ChevronLeft size={20} color="#374151" />
              <Text className="text-gray-700 font-medium ml-1">Back</Text>
            </Pressable>
          )}

          {!isSingleStep && (
            <View className="flex-row gap-1.5">
              {recipe.steps.map((_, i) => (
                <View
                  key={i}
                  className={`h-2 rounded-full ${
                    i === currentStep
                      ? "w-6 bg-primary-600"
                      : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </View>
          )}

          <Pressable
            onPress={
              currentStep === totalSteps - 1 ? handleDone : goNext
            }
            className="flex-row items-center px-5 py-3 rounded-xl bg-primary-700 active:bg-primary-800"
          >
            <Text className="text-white font-medium mr-1">
              {currentStep === totalSteps - 1 ? "Done" : "Next"}
            </Text>
            <ChevronRight size={20} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}
