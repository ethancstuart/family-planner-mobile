import { useState } from "react";
import { View, Text, Platform } from "react-native";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "familyplanner",
  path: "auth/callback",
});

export default function LoginScreen() {
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  const signInWithApple = async () => {
    if (Platform.OS !== "ios") return;
    setLoading("apple");

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) throw error;
        router.replace("/(app)/(tabs)/recipes");
      }
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code !== "ERR_REQUEST_CANCELED") {
        console.error("Apple sign in error:", e);
      }
    } finally {
      setLoading(null);
    }
  };

  const signInWithGoogle = async () => {
    setLoading("google");

    try {
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Crypto.getRandomBytes(32).toString()
      );

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            nonce,
          },
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === "success") {
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            router.replace("/(app)/(tabs)/recipes");
          }
        }
      }
    } catch (e) {
      console.error("Google sign in error:", e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-8">
      <View className="items-center mb-12">
        <Text className="text-4xl font-bold text-primary-700 mb-2">
          Family Planner
        </Text>
        <Text className="text-lg text-gray-500 text-center">
          Your family recipe vault & meal planner
        </Text>
      </View>

      <View className="gap-3">
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={12}
            style={{ height: 50 }}
            onPress={signInWithApple}
          />
        )}

        <Button
          title="Continue with Google"
          onPress={signInWithGoogle}
          variant="outline"
          size="lg"
          loading={loading === "google"}
        />
      </View>

      <Text className="text-xs text-gray-400 text-center mt-8 leading-5">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </Text>
    </View>
  );
}
