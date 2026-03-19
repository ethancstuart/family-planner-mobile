import { View, Text } from "react-native";
import { ListTodo } from "lucide-react-native";
import { Button } from "@/components/ui/button";

interface EmptyTodosProps {
  onCreateList: () => void;
}

export function EmptyTodos({ onCreateList }: EmptyTodosProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-16 h-16 rounded-full bg-purple-50 items-center justify-center mb-4">
        <ListTodo size={32} color="#7c3aed" />
      </View>
      <Text className="text-lg font-semibold text-gray-900 mb-1">
        No to-do lists yet
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        Create your first list to start tracking tasks with your household.
      </Text>
      <Button title="Create First List" onPress={onCreateList} />
    </View>
  );
}
