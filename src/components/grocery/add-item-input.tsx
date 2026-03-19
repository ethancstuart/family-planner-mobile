import { useState, useRef } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface AddItemInputProps {
  onAdd: (rawInput: string) => void;
}

export function AddItemInput({ onAdd }: AddItemInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd(value.trim());
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <View className="flex-row items-center gap-2 px-4 py-2">
      <View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2.5">
        <TextInput
          ref={inputRef}
          className="flex-1 text-base text-gray-900"
          placeholder='Add item (e.g., "2 lbs chicken")'
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={setValue}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          autoCapitalize="none"
        />
      </View>
      <Pressable
        onPress={handleSubmit}
        disabled={!value.trim()}
        className={`w-11 h-11 rounded-xl items-center justify-center ${
          value.trim() ? "bg-purple-600 active:bg-purple-700" : "bg-gray-200"
        }`}
      >
        <Plus size={20} color={value.trim() ? "#fff" : "#9ca3af"} />
      </Pressable>
    </View>
  );
}
