import { useState, useEffect, useCallback } from "react";
import { Modal, View, Text, FlatList, Pressable, Alert } from "react-native";
import { X, Trash2, FileText } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { apiFetch } from "@/lib/api";
import { Loading } from "@/components/ui/loading";

interface Template {
  id: string;
  name: string;
  created_at: string;
  slot_count: number;
}

interface ApplyTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  isApplying: boolean;
}

export function ApplyTemplateModal({
  visible,
  onClose,
  onApply,
  onDelete,
  isApplying,
}: ApplyTemplateModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ templates: Template[] }>("/api/meal-planner/templates");
      setTemplates(data.templates);
    } catch {
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchTemplates();
  }, [visible, fetchTemplates]);

  const confirmApply = (template: Template) => {
    Alert.alert(
      "Apply Template",
      `Replace all meals this week with "${template.name}"? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          style: "destructive",
          onPress: () => onApply(template.id),
        },
      ]
    );
  };

  const confirmDelete = (template: Template) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Template",
      `Delete "${template.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(template.id);
            setTemplates((prev) => prev.filter((t) => t.id !== template.id));
          },
        },
      ]
    );
  };

  const renderTemplate = ({ item }: { item: Template }) => {
    const date = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          confirmApply(item);
        }}
        className="flex-row items-center px-4 py-3.5 border-b border-gray-100 active:bg-gray-50"
        disabled={isApplying}
      >
        <FileText size={20} color="#7c3aed" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-gray-900">{item.name}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {item.slot_count} meals · {date}
          </Text>
        </View>
        <Pressable
          onPress={() => confirmDelete(item)}
          className="p-2 rounded-full active:bg-red-50"
          hitSlop={8}
        >
          <Trash2 size={18} color="#ef4444" />
        </Pressable>
      </Pressable>
    );
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
        <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
          <Text className="text-xl font-bold text-gray-900">Apply Template</Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        {isLoading ? (
          <Loading message="Loading templates..." />
        ) : templates.length === 0 ? (
          <View className="items-center py-12 px-8">
            <Text className="text-base text-gray-500">No templates saved yet</Text>
            <Text className="text-sm text-gray-400 mt-1 text-center">
              Save your current week as a template to reuse it later
            </Text>
          </View>
        ) : (
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </Modal>
  );
}
