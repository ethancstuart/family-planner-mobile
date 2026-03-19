import { ShoppingCart } from "lucide-react-native";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

interface EmptyGroceryProps {
  onCreateList: () => void;
}

export function EmptyGrocery({ onCreateList }: EmptyGroceryProps) {
  return (
    <EmptyState
      icon={<ShoppingCart size={48} color="#d1d5db" />}
      title="No grocery lists yet"
      description="Create a list from scratch or generate one from your meal plan."
      action={
        <Button
          title="Create List"
          onPress={onCreateList}
          variant="primary"
        />
      }
    />
  );
}
