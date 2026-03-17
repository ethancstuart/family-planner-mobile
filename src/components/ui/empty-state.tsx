import { View, Text } from "react-native";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-xl font-semibold text-gray-900 text-center">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-gray-500 text-center mt-2 leading-6">
          {description}
        </Text>
      )}
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
}
