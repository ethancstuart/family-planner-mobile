import React from "react";
import { View, Text, Pressable } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
            backgroundColor: "white",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
            {this.state.error?.message}
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{
              backgroundColor: "#7c3aed",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
