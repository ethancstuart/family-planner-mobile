import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Household, HouseholdMember } from "@/types";

export function useHousehold() {
  const { user } = useAuth();

  const membershipQuery = useQuery({
    queryKey: ["household-membership", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("household_members")
        .select("household_id, user_id, role, joined_at")
        .eq("user_id", user!.id)
        .limit(1)
        .single();

      if (error) throw error;
      return data as HouseholdMember;
    },
    enabled: !!user,
  });

  const householdQuery = useQuery({
    queryKey: ["household", membershipQuery.data?.household_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("households")
        .select("*")
        .eq("id", membershipQuery.data!.household_id)
        .single();

      if (error) throw error;
      return data as Household;
    },
    enabled: !!membershipQuery.data,
  });

  return {
    household: householdQuery.data ?? null,
    membership: membershipQuery.data ?? null,
    isLoading: membershipQuery.isLoading || householdQuery.isLoading,
    error: membershipQuery.error || householdQuery.error,
    isError: membershipQuery.isError || householdQuery.isError,
  };
}
