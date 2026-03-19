import { useState, useEffect, useRef } from "react";
import { Modal, View, Text, TextInput, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { Button } from "@/components/ui/button";

interface SaveTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving: boolean;
}

export function SaveTemplateModal({
  visible,
  onClose,
  onSave,
  isSaving,
}: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-xl font-bold text-gray-900">Save as Template</Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        <View className="px-4 mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Template Name</Text>
          <TextInput
            ref={inputRef}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
            placeholder="e.g., Weeknight Favorites"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <View className="flex-row gap-3 mt-6">
            <View className="flex-1">
              <Button title="Cancel" onPress={onClose} variant="outline" />
            </View>
            <View className="flex-1">
              <Button
                title="Save"
                onPress={() => onSave(name.trim())}
                disabled={!name.trim()}
                loading={isSaving}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
