import { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, CalendarDays, ShoppingCart, ChefHat } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "choose" | "create" | "join" | "features" | "first-recipe";

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createHousehold = async () => {
    if (!name.trim() || !user) return;
    setLoading(true);
    try {
      // Insert household directly via Supabase (no server-side secrets needed)
      const { data: household, error: hhError } = await supabase
        .from("households")
        .insert({ name: name.trim() })
        .select("id")
        .single();

      if (hhError) throw hhError;

      // Add current user as owner
      const { error: memError } = await supabase
        .from("household_members")
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: "owner",
        });

      if (memError) throw memError;

      // Create default household_settings row
      await supabase
        .from("household_settings")
        .insert({ household_id: household.id });

      queryClient.invalidateQueries({ queryKey: ["household"] });
      queryClient.invalidateQueries({ queryKey: ["household-membership"] });
      setStep("features");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to create household";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const joinHousehold = async () => {
    if (!token.trim()) return;
    setLoading(true);
    try {
      await apiFetch("/api/household/invite/accept", {
        method: "POST",
        body: JSON.stringify({ token: token.trim() }),
      });
      queryClient.invalidateQueries({ queryKey: ["household"] });
      router.replace("/(app)/(tabs)/recipes");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid invite";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFirst = async () => {
    if (!recipeUrl.trim()) {
      router.replace("/(app)/(tabs)/recipes");
      return;
    }
    setLoading(true);
    try {
      const isVideo =
        recipeUrl.includes("tiktok.com") ||
        recipeUrl.includes("youtube.com") ||
        recipeUrl.includes("youtu.be") ||
        recipeUrl.includes("instagram.com/reel");

      await apiFetch("/api/recipes/extract", {
        method: "POST",
        body: JSON.stringify({
          url: recipeUrl.trim(),
          mode: isVideo ? "video" : "url",
        }),
      });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      router.replace("/(app)/(tabs)/recipes");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import failed";
      Alert.alert("Import Error", msg + "\nYou can import recipes later.");
      router.replace("/(app)/(tabs)/recipes");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <BookOpen size={28} color="#7c3aed" />,
      title: "Recipe Vault",
      desc: "Import from any URL, photo, or video",
    },
    {
      icon: <ChefHat size={28} color="#7c3aed" />,
      title: "Cook Mode",
      desc: "Hands-free, step-by-step cooking",
    },
    {
      icon: <CalendarDays size={28} color="#7c3aed" />,
      title: "Meal Planning",
      desc: "Plan your week with drag & drop",
    },
    {
      icon: <ShoppingCart size={28} color="#7c3aed" />,
      title: "Grocery Lists",
      desc: "Auto-generated from meal plans",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {step === "choose" && (
            <View>
              <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                Welcome!
              </Text>
              <Text className="text-base text-gray-500 text-center mb-8">
                Create a new household or join an existing one
              </Text>
              <View className="gap-3">
                <Button
                  title="Create Household"
                  onPress={() => setStep("create")}
                  size="lg"
                />
                <Button
                  title="Join with Invite Code"
                  onPress={() => setStep("join")}
                  variant="outline"
                  size="lg"
                />
              </View>
            </View>
          )}

          {step === "create" && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
                Name Your Household
              </Text>
              <Input
                label="Household Name"
                placeholder="e.g., The Stuarts"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <View className="gap-3">
                <Button
                  title="Create"
                  onPress={createHousehold}
                  loading={loading}
                  disabled={!name.trim()}
                  size="lg"
                />
                <Button
                  title="Back"
                  onPress={() => setStep("choose")}
                  variant="ghost"
                />
              </View>
            </View>
          )}

          {step === "join" && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-6">
                Join a Household
              </Text>
              <Input
                label="Invite Code"
                placeholder="Paste your invite token"
                value={token}
                onChangeText={setToken}
              />
              <View className="gap-3">
                <Button
                  title="Join"
                  onPress={joinHousehold}
                  loading={loading}
                  disabled={!token.trim()}
                  size="lg"
                />
                <Button
                  title="Back"
                  onPress={() => setStep("choose")}
                  variant="ghost"
                />
              </View>
            </View>
          )}

          {step === "features" && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                What you can do
              </Text>
              <Text className="text-base text-gray-500 text-center mb-8">
                Everything your family needs in one place
              </Text>
              <View className="gap-5 mb-8">
                {features.map((f) => (
                  <View key={f.title} className="flex-row items-center">
                    <View className="bg-primary-50 rounded-2xl p-3 mr-4">
                      {f.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {f.title}
                      </Text>
                      <Text className="text-sm text-gray-500">{f.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Button
                title="Continue"
                onPress={() => setStep("first-recipe")}
                size="lg"
              />
            </View>
          )}

          {step === "first-recipe" && (
            <View>
              <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                Import Your First Recipe
              </Text>
              <Text className="text-base text-gray-500 text-center mb-6">
                Paste a recipe URL to get started, or skip for now
              </Text>
              <Input
                placeholder="https://..."
                value={recipeUrl}
                onChangeText={setRecipeUrl}
                keyboardType="url"
              />
              <View className="gap-3">
                <Button
                  title={recipeUrl.trim() ? "Import & Continue" : "Skip"}
                  onPress={handleImportFirst}
                  loading={loading}
                  size="lg"
                  variant={recipeUrl.trim() ? "primary" : "outline"}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
