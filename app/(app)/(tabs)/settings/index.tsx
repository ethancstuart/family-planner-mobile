import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  Pressable,
  Share,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import {
  LogOut,
  Key,
  Home,
  User,
  Users,
  UserPlus,
  Crown,
  ChevronRight,
} from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useHousehold } from "@/hooks/use-household";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HouseholdSettings } from "@/types";

interface MemberRow {
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profiles: { email: string; full_name: string | null } | null;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { household, membership } = useHousehold();
  const queryClient = useQueryClient();
  const isOwner = membership?.role === "owner";

  const [claudeKey, setClaudeKey] = useState("");
  const [spoonacularKey, setSpoonacularKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [inviting, setInviting] = useState(false);

  // Load API key status
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

  // Load members
  useEffect(() => {
    if (!membership) return;

    async function loadMembers() {
      const { data } = await supabase
        .from("household_members")
        .select("user_id, role, joined_at, profiles(email, full_name)")
        .eq("household_id", membership!.household_id);

      if (data) setMembers(data as unknown as MemberRow[]);
    }

    loadMembers();
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

  const handleInvite = async () => {
    if (!membership) return;
    setInviting(true);
    try {
      const data = await apiFetch<{ token: string; url: string }>(
        "/api/household/invite",
        { method: "POST" }
      );
      await Share.share({
        message: `Join my household on Family Planner! Use invite code: ${data.token}`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create invite";
      Alert.alert("Error", msg);
    } finally {
      setInviting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">Settings</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Members */}
          {members.length > 0 && (
            <Card className="mb-4">
              <View className="flex-row items-center mb-3">
                <Users size={18} color="#7c3aed" />
                <Text className="text-base font-semibold text-gray-900 ml-2">
                  Members ({members.length})
                </Text>
              </View>
              {members.map((m) => (
                <View
                  key={m.user_id}
                  className="flex-row items-center py-2 border-b border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="text-sm text-gray-900">
                      {m.profiles?.full_name || m.profiles?.email || "Member"}
                    </Text>
                    {m.profiles?.full_name && (
                      <Text className="text-xs text-gray-400">
                        {m.profiles.email}
                      </Text>
                    )}
                  </View>
                  {m.role === "owner" && (
                    <Badge
                      label="Owner"
                      variant="primary"
                    />
                  )}
                </View>
              ))}

              {/* Invite button (owner only) */}
              {isOwner && (
                <View className="mt-3">
                  <Button
                    title="Invite Member"
                    onPress={handleInvite}
                    variant="outline"
                    size="sm"
                    loading={inviting}
                    icon={<UserPlus size={16} color="#374151" />}
                  />
                </View>
              )}
            </Card>
          )}

          {/* API Keys (owner only) */}
          {isOwner && (
            <Card className="mb-4">
              <View className="flex-row items-center mb-3">
                <Key size={18} color="#7c3aed" />
                <Text className="text-base font-semibold text-gray-900 ml-2">
                  API Keys
                </Text>
              </View>
              <Text className="text-xs text-gray-400 mb-3">
                Required for AI recipe import. Only household owners can manage
                keys.
              </Text>
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
          )}

          {/* Sign out */}
          <View className="mb-4">
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="outline"
              icon={<LogOut size={18} color="#374151" />}
            />
          </View>

          {/* App version */}
          <Text className="text-xs text-gray-400 text-center mb-8">
            Family Planner v{appVersion}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
