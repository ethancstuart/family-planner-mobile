import { CalendarDays } from "lucide-react-native";
import { router } from "expo-router";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function EmptyMealPlan() {
  return (
    <EmptyState
      icon={<CalendarDays size={48} color="#d1d5db" />}
      title="Plan your first week"
      description="Add meals from your recipe collection to plan the week ahead."
      action={
        <Button
          title="Go to Recipes"
          onPress={() => router.push("/(app)/(tabs)/recipes")}
          variant="outline"
        />
      }
    />
  );
}
