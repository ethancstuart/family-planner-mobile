import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Loading } from "@/components/ui/loading";

export default function Index() {
  const { session, isLoading } = useAuth();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.replace("/(auth)/login");
      return;
    }

    // Check if user has a household
    setChecking(true);
    (async () => {
      try {
        const { data } = await supabase
          .from("household_members")
          .select("household_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();

        if (data) {
          router.replace("/(app)/(tabs)/recipes");
        } else {
          router.replace("/(app)/onboarding");
        }
      } catch {
        router.replace("/(app)/onboarding");
      } finally {
        setChecking(false);
      }
    })();
  }, [session, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Loading fullScreen message={checking ? "Loading..." : undefined} />
    </View>
  );
}
