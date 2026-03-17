import { useState } from "react";
import { View, Text, Platform, Alert, KeyboardAvoidingView } from "react-native";
import { router } from "expo-router";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "familyplanner",
  path: "auth/callback",
});

export default function LoginScreen() {
  const [loading, setLoading] = useState<"apple" | "google" | "email" | null>(
    null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);

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
        router.replace("/");
      }
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert(
          "Sign In Failed",
          err.message || "Apple sign in failed. Please try again."
        );
      }
    } finally {
      setLoading(null);
    }
  };

  const signInWithGoogle = async () => {
    setLoading("google");

    try {
      // Let Supabase handle PKCE — no custom nonce needed
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
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

          // Try hash fragment first, then query params (Supabase PKCE uses query)
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          if (url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            accessToken = hashParams.get("access_token");
            refreshToken = hashParams.get("refresh_token");
          }

          if (!accessToken) {
            accessToken = url.searchParams.get("access_token");
            refreshToken = url.searchParams.get("refresh_token");
          }

          // If PKCE flow, exchange the code
          if (!accessToken) {
            const code = url.searchParams.get("code");
            if (code) {
              const { error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);
              if (exchangeError) throw exchangeError;
              router.replace("/");
              return;
            }
          }

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            router.replace("/");
          } else {
            Alert.alert(
              "Sign In Failed",
              "Could not complete Google sign in. Please try again."
            );
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Google sign in failed";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setLoading(null);
    }
  };

  const signInWithEmail = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading("email");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) throw error;
      router.replace("/");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Sign in failed";
      Alert.alert("Sign In Failed", msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-primary-700 mb-2">
            Family Planner
          </Text>
          <Text className="text-lg text-gray-500 text-center">
            Your family recipe vault & meal planner
          </Text>
        </View>

        {showEmailForm ? (
          <View className="gap-3">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button
              title="Sign In"
              onPress={signInWithEmail}
              size="lg"
              loading={loading === "email"}
              disabled={!email.trim() || !password.trim()}
            />
            <Button
              title="Back"
              onPress={() => setShowEmailForm(false)}
              variant="ghost"
            />
          </View>
        ) : (
          <View className="gap-3">
            {Platform.OS === "ios" && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
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

            <Button
              title="Sign in with Email"
              onPress={() => setShowEmailForm(true)}
              variant="ghost"
              size="lg"
            />
          </View>
        )}

        <Text className="text-xs text-gray-400 text-center mt-8 leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
