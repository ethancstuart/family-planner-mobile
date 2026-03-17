import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Loading } from "@/components/ui/loading";

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        router.replace("/(app)/(tabs)/recipes");
      } else {
        router.replace("/(auth)/login");
      }
    }

    handleCallback();
  }, [params.access_token, params.refresh_token]);

  return <Loading fullScreen message="Signing in..." />;
}
