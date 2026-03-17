import { TextInput, View, Text } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "url" | "number-pad";
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = "none",
  keyboardType = "default",
  multiline,
  numberOfLines,
  error,
}: InputProps) {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      )}
      <TextInput
        className={`rounded-xl border px-4 py-3 text-base text-gray-900 ${
          error ? "border-red-400" : "border-gray-300"
        } ${multiline ? "min-h-[100px]" : ""}`}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">{error}</Text>
      )}
    </View>
  );
}
