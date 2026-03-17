import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { Loading } from "@/components/ui/loading";

export default function AppLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/(auth)/login");
    }
  }, [session, isLoading]);

  if (isLoading || !session) {
    return <Loading fullScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
    </Stack>
  );
}
