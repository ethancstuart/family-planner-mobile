import { Modal, View, Text, Pressable, FlatList } from "react-native";
import { X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface Member {
  user_id: string;
  full_name: string | null;
  email: string;
}

interface AssignMemberModalProps {
  visible: boolean;
  onClose: () => void;
  members: Member[];
  currentAssignee: string | null;
  onAssign: (userId: string | null) => void;
}

export function AssignMemberModal({
  visible,
  onClose,
  members,
  currentAssignee,
  onAssign,
}: AssignMemberModalProps) {
  const handleSelect = (userId: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAssign(userId);
    onClose();
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
          <Text className="text-xl font-bold text-gray-900">Assign To</Text>
          <Pressable
            onPress={onClose}
            className="p-2 rounded-full active:bg-gray-100"
            hitSlop={8}
          >
            <X size={22} color="#374151" />
          </Pressable>
        </View>

        {/* Unassign option */}
        {currentAssignee && (
          <Pressable
            onPress={() => handleSelect(null)}
            className="flex-row items-center gap-3 mx-4 mb-2 px-4 py-3 bg-white rounded-xl border border-gray-100 active:bg-gray-50"
          >
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <X size={18} color="#6b7280" />
            </View>
            <Text className="text-base text-gray-600">Unassign</Text>
          </Pressable>
        )}

        {/* Members */}
        <FlatList
          data={members}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => {
            const name = item.full_name || item.email;
            const initials = (item.full_name || item.email)
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const isAssigned = item.user_id === currentAssignee;

            return (
              <Pressable
                onPress={() => handleSelect(item.user_id)}
                className={`flex-row items-center gap-3 px-4 py-3 bg-white rounded-xl border active:bg-gray-50 ${
                  isAssigned ? "border-purple-300" : "border-gray-100"
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isAssigned ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isAssigned ? "text-purple-700" : "text-gray-500"
                    }`}
                  >
                    {initials}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900">
                    {name}
                  </Text>
                  {item.full_name && (
                    <Text className="text-xs text-gray-400">{item.email}</Text>
                  )}
                </View>
                {isAssigned && (
                  <View className="w-5 h-5 rounded-full bg-purple-600 items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
