import { useState } from "react";
import { View, TextInput } from "react-native";
import { Plus } from "lucide-react-native";

interface AddTodoInputProps {
  onAdd: (item: { title: string; dueDate: string | null }) => void;
}

export function AddTodoInput({ onAdd }: AddTodoInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;

    const { title, dueDate } = parseTodoInput(value);
    if (!title) return;

    onAdd({ title, dueDate });
    setValue("");
  };

  return (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5">
      <Plus size={16} color="#9ca3af" />
      <TextInput
        className="flex-1 ml-2 text-base text-gray-900"
        placeholder='Add a task (try "due:friday")'
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        returnKeyType="done"
        autoCapitalize="sentences"
      />
    </View>
  );
}

/** Parse natural-language due dates from todo input: "Buy milk due:friday" */
export function parseTodoInput(input: string): {
  title: string;
  dueDate: string | null;
} {
  const dueMatch = input.match(/\bdue:(\S+)/i);

  if (!dueMatch) {
    return { title: input.trim(), dueDate: null };
  }

  const title = input.replace(dueMatch[0], "").trim();
  const dueStr = dueMatch[1].toLowerCase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday",
  ];

  let dueDate: Date | null = null;

  if (dueStr === "today") {
    dueDate = today;
  } else if (dueStr === "tomorrow") {
    dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 1);
  } else {
    const dayIndex = dayNames.indexOf(dueStr);
    if (dayIndex !== -1) {
      dueDate = new Date(today);
      const currentDay = dueDate.getDay();
      let diff = dayIndex - currentDay;
      if (diff <= 0) diff += 7;
      dueDate.setDate(dueDate.getDate() + diff);
    } else {
      // Try parsing as YYYY-MM-DD or MM/DD
      const parsed = new Date(dueStr);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }
  }

  if (dueDate) {
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const day = String(dueDate.getDate()).padStart(2, "0");
    return { title, dueDate: `${year}-${month}-${day}` };
  }

  return { title, dueDate: null };
}
