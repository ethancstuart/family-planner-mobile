import { useState, useEffect } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, Key, Home, User } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useHousehold } from "@/hooks/use-household";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { HouseholdSettings } from "@/types";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { household, membership } = useHousehold();
  const [claudeKey, setClaudeKey] = useState("");
  const [spoonacularKey, setSpoonacularKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!membership) return;

    async function loadSettings() {
      const { data } = await supabase
        .from("household_settings")
        .select("claude_api_key_encrypted, spoonacular_api_key")
        .eq("household_id", membership!.household_id)
        .single();

      if (data) {
        if (data.claude_api_key_encrypted) setClaudeKey("********");
        if (data.spoonacular_api_key) setSpoonacularKey("********");
      }
    }

    loadSettings();
  }, [membership]);

  const saveKeys = async () => {
    if (!membership) return;
    setSaving(true);

    try {
      const updates: Partial<HouseholdSettings> = {};
      if (claudeKey && claudeKey !== "********") {
        updates.claude_api_key_encrypted = claudeKey;
      }
      if (spoonacularKey && spoonacularKey !== "********") {
        updates.spoonacular_api_key = spoonacularKey;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("household_settings")
          .update(updates)
          .eq("household_id", membership.household_id);

        if (error) throw error;
        Alert.alert("Saved", "API keys updated.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-1">
            <User size={18} color="#7c3aed" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              Account
            </Text>
          </View>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
        </Card>

        {/* Household */}
        {household && (
          <Card className="mb-4">
            <View className="flex-row items-center mb-1">
              <Home size={18} color="#7c3aed" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Household
              </Text>
            </View>
            <Text className="text-sm text-gray-500">{household.name}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              Role: {membership?.role}
            </Text>
          </Card>
        )}

        {/* API Keys */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Key size={18} color="#7c3aed" />
            <Text className="text-base font-semibold text-gray-900 ml-2">
              API Keys
            </Text>
          </View>
          <Input
            label="Claude API Key"
            placeholder="sk-ant-..."
            value={claudeKey}
            onChangeText={setClaudeKey}
            secureTextEntry
          />
          <Input
            label="Spoonacular API Key"
            placeholder="Your key..."
            value={spoonacularKey}
            onChangeText={setSpoonacularKey}
            secureTextEntry
          />
          <Button title="Save Keys" onPress={saveKeys} loading={saving} />
        </Card>

        {/* Sign out */}
        <View className="mb-8">
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            icon={<LogOut size={18} color="#374151" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
