import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "accent";
}

const variants = {
  default: "bg-gray-100",
  primary: "bg-primary-100",
  accent: "bg-accent-100",
} as const;

const textVariants = {
  default: "text-gray-700",
  primary: "text-primary-700",
  accent: "text-accent-700",
} as const;

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <View className={`rounded-full px-2.5 py-0.5 ${variants[variant]}`}>
      <Text className={`text-xs font-medium ${textVariants[variant]}`}>
        {label}
      </Text>
    </View>
  );
}
