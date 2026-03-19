import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
  isCreating: boolean;
}

export function CreateListModal({
  visible,
  onClose,
  onCreate,
  isCreating,
}: CreateListModalProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTitle("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  const handleCreate = () => {
    if (!title.trim() || isCreating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCreate(title.trim());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <Text className="text-xl font-bold text-gray-900">New To-Do List</Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        <Text className="px-4 text-sm text-gray-500 mb-4">
          Give your list a name.
        </Text>

        <View className="px-4 gap-4">
          <View className="bg-white rounded-xl border border-gray-200 px-3 py-2.5">
            <TextInput
              ref={inputRef}
              className="text-base text-gray-900"
              placeholder="e.g., House chores"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              autoCapitalize="sentences"
            />
          </View>
          <Pressable
            onPress={handleCreate}
            disabled={!title.trim() || isCreating}
            className={`rounded-xl py-3 items-center ${
              title.trim() && !isCreating
                ? "bg-purple-600 active:bg-purple-700"
                : "bg-gray-200"
            }`}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  title.trim() ? "text-white" : "text-gray-400"
                }`}
              >
                Create List
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
