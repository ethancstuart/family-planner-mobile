import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary: "bg-primary-700 active:bg-primary-800",
  secondary: "bg-accent-600 active:bg-accent-700",
  outline: "border border-gray-300 active:bg-gray-50",
  ghost: "active:bg-gray-100",
} as const;

const textStyles = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-gray-900",
  ghost: "text-gray-700",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2.5",
  lg: "px-6 py-3.5",
} as const;

const textSizeStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
} as const;

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center rounded-xl ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "secondary" ? "#fff" : "#7c3aed"}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`font-semibold ${textStyles[variant]} ${textSizeStyles[size]} ${icon ? "ml-2" : ""}`}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
