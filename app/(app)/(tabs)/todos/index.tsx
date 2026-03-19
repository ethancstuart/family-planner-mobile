import { useState, useCallback, useMemo, useEffect } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, AlertCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/lib/auth-context";
import { useHousehold } from "@/hooks/use-household";
import { useTodoLists } from "@/hooks/use-todos";
import { useCreateTodoList, useAssignTodoItem } from "@/hooks/use-todo-mutations";
import { supabase } from "@/lib/supabase";

import { TodoListCard } from "@/components/todos/todo-list-card";
import { TodoFilters } from "@/components/todos/todo-filters";
import { CreateListModal } from "@/components/todos/create-list-modal";
import { AssignMemberModal } from "@/components/todos/assign-member-modal";
import { EmptyTodos } from "@/components/todos/empty-todos";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

interface MemberRow {
  user_id: string;
  full_name: string | null;
  email: string;
}

export default function TodosScreen() {
  const { user } = useAuth();
  const { membership } = useHousehold();
  const householdId = membership?.household_id;

  const { data: lists, isLoading, isError, error, refetch, isRefetching } =
    useTodoLists();

  const createList = useCreateTodoList();
  const assignItem = useAssignTodoItem();

  const [filter, setFilter] = useState("all");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [members, setMembers] = useState<MemberRow[]>([]);

  // Assign modal state
  const [assignModal, setAssignModal] = useState<{
    visible: boolean;
    itemId: string;
    listId: string;
    currentAssignee: string | null;
  }>({ visible: false, itemId: "", listId: "", currentAssignee: null });

  // Load household members
  useEffect(() => {
    if (!householdId) return;
    async function loadMembers() {
      const { data } = await supabase
        .from("household_members")
        .select("user_id, profiles(email, full_name)")
        .eq("household_id", householdId!);

      if (data) {
        setMembers(
          data.map((m: any) => ({
            user_id: m.user_id,
            full_name: m.profiles?.full_name ?? null,
            email: m.profiles?.email ?? "",
          }))
        );
      }
    }
    loadMembers();
  }, [householdId]);

  // Compute stats from list-level counts
  const stats = useMemo(() => {
    if (!lists) return { remaining: 0, overdue: 0, done: 0 };
    return {
      remaining: lists.reduce((sum, l) => sum + (l.totalItems - l.completedItems), 0),
      overdue: 0, // computed per-item in the cards; stats bar shows list-level totals
      done: lists.reduce((sum, l) => sum + l.completedItems, 0),
    };
  }, [lists]);

  const handleCreateList = useCallback(
    (title: string) => {
      if (!householdId) return;
      createList.mutate(
        { householdId, title },
        {
          onSuccess: () => {
            setCreateModalVisible(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          onError: () => Alert.alert("Error", "Failed to create list."),
        }
      );
    },
    [householdId, createList]
  );

  const handleOpenAssign = useCallback(
    (itemId: string, listId: string) => {
      // Find the current assignee from the item — we'll get it from the todo-items query
      setAssignModal({
        visible: true,
        itemId,
        listId,
        currentAssignee: null, // The modal will allow assigning either way
      });
    },
    []
  );

  const handleAssign = useCallback(
    (userId: string | null) => {
      // Validate the userId is a real household member
      if (userId && !members.some((m) => m.user_id === userId)) return;

      assignItem.mutate({
        itemId: assignModal.itemId,
        assignedTo: userId,
        listId: assignModal.listId,
      });
    },
    [assignModal, assignItem, members]
  );

  const openCreateModal = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCreateModalVisible(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Text className="text-2xl font-bold text-gray-900">To-Dos</Text>
        {(lists?.length ?? 0) > 0 && (
          <Button
            title="New List"
            onPress={openCreateModal}
            size="sm"
            icon={<Plus size={16} color="#fff" />}
          />
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <Loading message="Loading to-dos..." />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <AlertCircle size={40} color="#ef4444" />
          <Text className="text-lg font-semibold text-gray-900 mt-3">
            Something went wrong
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-center mb-4">
            {error?.message ?? "Failed to load to-dos"}
          </Text>
          <Button title="Try Again" onPress={() => refetch()} variant="outline" />
        </View>
      ) : !lists || lists.length === 0 ? (
        <EmptyTodos onCreateList={openCreateModal} />
      ) : (
        <>
          {/* Stats bar */}
          <View className="flex-row px-4 gap-3 mb-3">
            <View className="flex-1 bg-white rounded-xl border border-gray-100 p-4 items-center">
              <Text className="text-xl font-bold text-gray-900">
                {stats.remaining}
              </Text>
              <Text className="text-xs text-gray-500">Remaining</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl border border-gray-100 p-4 items-center">
              <Text className={`text-xl font-bold ${stats.overdue > 0 ? "text-red-500" : "text-gray-900"}`}>
                {stats.overdue}
              </Text>
              <Text className="text-xs text-gray-500">Overdue</Text>
            </View>
            <View className="flex-1 bg-white rounded-xl border border-gray-100 p-4 items-center">
              <Text className="text-xl font-bold text-gray-900">
                {stats.done}
              </Text>
              <Text className="text-xs text-gray-500">Done</Text>
            </View>
          </View>

          {/* Filters */}
          <View className="mb-3">
            <TodoFilters active={filter} onChange={setFilter} />
          </View>

          {/* Lists */}
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <TodoListCard
                list={item}
                index={index}
                members={members}
                userId={user?.id ?? ""}
                filter={filter}
                onAssign={handleOpenAssign}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
            refreshing={isRefetching}
            onRefresh={refetch}
            maxToRenderPerBatch={10}
            windowSize={5}
            keyboardDismissMode="on-drag"
          />
        </>
      )}

      {/* Create List Modal */}
      <CreateListModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateList}
        isCreating={createList.isPending}
      />

      {/* Assign Member Modal */}
      <AssignMemberModal
        visible={assignModal.visible}
        onClose={() => setAssignModal((prev) => ({ ...prev, visible: false }))}
        members={members}
        currentAssignee={assignModal.currentAssignee}
        onAssign={handleAssign}
      />
    </SafeAreaView>
  );
}
