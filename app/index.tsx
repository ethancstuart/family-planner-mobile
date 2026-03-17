import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <Text style={{ fontSize: 18, color: "gray" }}>Loading...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/(tabs)/recipes" />;
  }

  return <Redirect href="/(auth)/login" />;
}
