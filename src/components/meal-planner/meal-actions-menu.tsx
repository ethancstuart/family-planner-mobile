import { Platform, ActionSheetIOS, Alert } from "react-native";

interface MealActionsMenuProps {
  onCopyLastWeek: () => void;
  onSaveTemplate: () => void;
  onApplyTemplate: () => void;
}

export function showMealActionsMenu({
  onCopyLastWeek,
  onSaveTemplate,
  onApplyTemplate,
}: MealActionsMenuProps) {
  const options = ["Copy Last Week", "Save as Template", "Apply Template", "Cancel"];
  const cancelButtonIndex = 3;

  const handleAction = (index: number) => {
    switch (index) {
      case 0:
        onCopyLastWeek();
        break;
      case 1:
        onSaveTemplate();
        break;
      case 2:
        onApplyTemplate();
        break;
    }
  };

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex },
      handleAction
    );
  } else {
    // Fallback for Android — use Alert with buttons
    Alert.alert("Meal Plan Actions", undefined, [
      { text: "Copy Last Week", onPress: onCopyLastWeek },
      { text: "Save as Template", onPress: onSaveTemplate },
      { text: "Apply Template", onPress: onApplyTemplate },
      { text: "Cancel", style: "cancel" },
    ]);
  }
}
