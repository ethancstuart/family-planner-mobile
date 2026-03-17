import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {children}
    </View>
  );
}
