import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingScreen() {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [loading, setLoading] = useState(false);

  const createHousehold = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await apiFetch("/api/household/create", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      router.replace("/(app)/(tabs)/recipes");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create household";
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
      router.replace("/(app)/(tabs)/recipes");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid invite";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-8">
      <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
        Welcome!
      </Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Create a new household or join an existing one
      </Text>

      {mode === "choose" && (
        <View className="gap-3">
          <Button
            title="Create Household"
            onPress={() => setMode("create")}
            size="lg"
          />
          <Button
            title="Join with Invite Code"
            onPress={() => setMode("join")}
            variant="outline"
            size="lg"
          />
        </View>
      )}

      {mode === "create" && (
        <View>
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
              onPress={() => setMode("choose")}
              variant="ghost"
            />
          </View>
        </View>
      )}

      {mode === "join" && (
        <View>
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
              onPress={() => setMode("choose")}
              variant="ghost"
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
