import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { Link2, Camera, ClipboardPaste, ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { useHousehold } from "@/hooks/use-household";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useQueryClient } from "@tanstack/react-query";
import type { Recipe } from "@/types";

export default function ImportRecipeScreen() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const { membership } = useHousehold();
  const queryClient = useQueryClient();

  // Check clipboard for URL on mount
  useEffect(() => {
    async function checkClipboard() {
      const hasString = await Clipboard.hasStringAsync();
      if (!hasString) return;

      const text = await Clipboard.getStringAsync();
      try {
        const parsed = new URL(text);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          setClipboardUrl(text);
        }
      } catch {
        // Not a URL
      }
    }

    checkClipboard();
  }, []);

  const extractRecipe = useCallback(
    async (sourceUrl: string, mode: "url" | "video" | "image", image?: string) => {
      setLoading(true);
      try {
        const body: Record<string, string> = { mode };
        if (mode === "image" && image) {
          body.image = image;
        } else {
          body.url = sourceUrl;
        }

        const data = await apiFetch<{ recipe: Partial<Recipe> }>(
          "/api/recipes/extract",
          { method: "POST", body: JSON.stringify(body) }
        );

        // Save the extracted recipe
        const { error } = await supabase.from("recipes").insert({
          ...data.recipe,
          household_id: membership!.household_id,
          created_by: (await supabase.auth.getUser()).data.user!.id,
        });

        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ["recipes"] });
        Alert.alert("Recipe imported!", data.recipe.title ?? "New recipe", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Import failed";
        Alert.alert("Import Error", msg);
      } finally {
        setLoading(false);
      }
    },
    [membership, queryClient]
  );

  const handleUrlImport = useCallback(() => {
    if (!url.trim()) return;

    // Detect if it's a video URL
    const isVideo =
      url.includes("tiktok.com") ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("instagram.com/reel");

    extractRecipe(url.trim(), isVideo ? "video" : "url");
  }, [url, extractRecipe]);

  const handleCameraImport = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? "image/jpeg";
      const base64 = `data:${mimeType};base64,${asset.base64}`;
      extractRecipe("", "image", base64);
    }
  }, [extractRecipe]);

  const handlePhotoLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? "image/jpeg";
      const base64 = `data:${mimeType};base64,${asset.base64}`;
      extractRecipe("", "image", base64);
    }
  }, [extractRecipe]);

  if (loading) {
    return <Loading fullScreen message="Extracting recipe with AI..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-row items-center px-4 pb-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={24} color="#111827" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3">
          Import Recipe
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Clipboard suggestion */}
        {clipboardUrl && (
          <Card className="mb-4 bg-primary-50 border-primary-200">
            <View className="flex-row items-center mb-2">
              <ClipboardPaste size={18} color="#7c3aed" />
              <Text className="text-sm font-medium text-primary-700 ml-2">
                URL detected in clipboard
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mb-3" numberOfLines={1}>
              {clipboardUrl}
            </Text>
            <Button
              title="Import from Clipboard"
              onPress={() => {
                setUrl(clipboardUrl);
                setClipboardUrl(null);
                // Auto-detect video URL
                const isVideo =
                  clipboardUrl.includes("tiktok.com") ||
                  clipboardUrl.includes("youtube.com") ||
                  clipboardUrl.includes("youtu.be") ||
                  clipboardUrl.includes("instagram.com/reel");
                extractRecipe(clipboardUrl, isVideo ? "video" : "url");
              }}
              size="sm"
            />
          </Card>
        )}

        {/* URL import */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Link2 size={20} color="#7c3aed" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              From URL
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            Paste a recipe URL, TikTok, YouTube, or Instagram link
          </Text>
          <Input
            placeholder="https://..."
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Button
            title="Import"
            onPress={handleUrlImport}
            disabled={!url.trim()}
          />
        </Card>

        {/* Camera import */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Camera size={20} color="#7c3aed" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              From Photo
            </Text>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            Take a photo or select a screenshot of a recipe
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="Camera"
                onPress={handleCameraImport}
                variant="outline"
              />
            </View>
            <View className="flex-1">
              <Button
                title="Photo Library"
                onPress={handlePhotoLibrary}
                variant="outline"
              />
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
