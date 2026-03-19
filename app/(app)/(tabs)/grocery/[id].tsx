import { useState, useCallback } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ArrowLeft,
  Trash2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useGroceryList, useGroceryItems } from "@/hooks/use-grocery";
import {
  useAddGroceryItem,
  useToggleGroceryItem,
  useDeleteGroceryItem,
  useDeleteGroceryList,
} from "@/hooks/use-grocery-mutations";

import { AddItemInput } from "@/components/grocery/add-item-input";
import { CategorySection } from "@/components/grocery/category-section";
import { GroceryItemRow } from "@/components/grocery/grocery-item-row";
import { ShoppingMode } from "@/components/grocery/shopping-mode";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

import type { GroceryItem } from "@/types";

export default function GroceryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shoppingMode, setShoppingMode] = useState(false);

  const { data: list, isLoading: listLoading } = useGroceryList(id);
  const { data: itemData, isLoading: itemsLoading } = useGroceryItems(id);

  const addItem = useAddGroceryItem();
  const toggleItem = useToggleGroceryItem();
  const deleteItem = useDeleteGroceryItem();
  const deleteList = useDeleteGroceryList();

  const isLoading = listLoading || itemsLoading;

  const handleToggle = useCallback(
    (itemId: string, checked: boolean) => {
      if (!id) return;
      toggleItem.mutate({ itemId, checked, listId: id });
    },
    [id, toggleItem]
  );

  const handleDelete = useCallback(
    (itemId: string) => {
      if (!id) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      deleteItem.mutate({ itemId, listId: id });
    },
    [id, deleteItem]
  );

  const handleAddItem = useCallback(
    (rawInput: string) => {
      if (!id) return;
      addItem.mutate({ listId: id, rawInput });
    },
    [id, addItem]
  );

  const handleDeleteList = useCallback(() => {
    if (!id) return;
    Alert.alert(
      "Delete grocery list?",
      `"${list?.title}" and all its items will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteList.mutate(
              { listId: id },
              {
                onSuccess: () => {
                  router.back();
                },
                onError: () => Alert.alert("Error", "Failed to delete list."),
              }
            );
          },
        },
      ]
    );
  }, [id, list, deleteList]);

  // Shopping mode — full screen
  if (shoppingMode && itemData) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ShoppingMode
          title={list?.title ?? "Shopping"}
          items={itemData.items}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onExit={() => setShoppingMode(false)}
        />
      </GestureHandlerRootView>
    );
  }

  if (isLoading) {
    return <Loading fullScreen message="Loading list..." />;
  }

  if (!list) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center" edges={["top"]}>
        <AlertCircle size={40} color="#ef4444" />
        <Text className="text-lg font-semibold text-gray-900 mt-3">
          List not found
        </Text>
        <View className="mt-4">
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const allItems = itemData?.items ?? [];
  const totalCount = allItems.length;
  const checkedCount = itemData?.checked.length ?? 0;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-2">
          <View className="flex-row items-center gap-2 flex-1">
            <Pressable
              onPress={() => router.back()}
              className="p-1 rounded-full active:bg-gray-100"
              hitSlop={8}
            >
              <ArrowLeft size={22} color="#374151" />
            </Pressable>
            <View className="flex-1">
              <Text
                className="text-xl font-bold text-gray-900"
                numberOfLines={1}
              >
                {list.title}
              </Text>
              <Text className="text-sm text-gray-500">
                {totalCount === 0
                  ? "No items yet"
                  : `${checkedCount}/${totalCount} items`}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1">
            {totalCount > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShoppingMode(true);
                }}
                className="flex-row items-center gap-1.5 bg-purple-600 rounded-xl px-3 py-2 active:bg-purple-700"
              >
                <ShoppingCart size={16} color="#fff" />
                <Text className="text-sm font-semibold text-white">Shop</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleDeleteList}
              className="p-2 rounded-full active:bg-gray-100"
              hitSlop={8}
            >
              <Trash2 size={20} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View className="px-4 pb-2">
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </View>
              <Text className="text-xs font-medium text-gray-500">
                {checkedCount}/{totalCount}
              </Text>
            </View>
          </View>
        )}

        {/* Add item input */}
        <AddItemInput onAdd={handleAddItem} />

        {/* Items */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {totalCount === 0 ? (
            <View className="items-center py-12">
              <Text className="text-base text-gray-500">
                Add your first item above
              </Text>
            </View>
          ) : (
            <>
              {(itemData?.sortedCategories ?? []).map((category) => (
                <CategorySection key={category} category={category}>
                  {(itemData!.grouped.get(category) ?? []).map((item) => (
                    <View key={item.id} className="mb-1.5">
                      <GroceryItemRow
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    </View>
                  ))}
                </CategorySection>
              ))}

              {(itemData?.checked.length ?? 0) > 0 && (
                <View className="mt-4">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
                    Checked off ({checkedCount})
                  </Text>
                  <View className="opacity-60 gap-1.5">
                    {itemData!.checked.map((item) => (
                      <GroceryItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
