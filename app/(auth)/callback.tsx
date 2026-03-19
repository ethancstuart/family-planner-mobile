import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Loading } from "@/components/ui/loading";

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
    code?: string;
  }>();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Token path: used by Apple Sign-In (native flow passes tokens directly).
        // Code path (PKCE): used by Google OAuth via expo-auth-session.
        // Both are standard Supabase auth patterns.
        if (params.access_token && params.refresh_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
          router.replace("/");
        } else if (params.code) {
          await supabase.auth.exchangeCodeForSession(params.code);
          router.replace("/");
        } else {
          router.replace("/(auth)/login");
        }
      } catch {
        router.replace("/(auth)/login");
      }
    }

    handleCallback();
  }, [params.access_token, params.refresh_token, params.code]);

  return <Loading fullScreen message="Signing in..." />;
}
