import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { Loading } from "@/components/ui/loading";

export default function AppLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
    </Stack>
  );
}
