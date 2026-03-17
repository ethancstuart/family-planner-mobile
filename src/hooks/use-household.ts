import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import type { Household, HouseholdMember } from "@/types";

export function useHousehold() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [membership, setMembership] = useState<HouseholdMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHousehold(null);
      setMembership(null);
      setIsLoading(false);
      return;
    }

    async function fetchHousehold() {
      const { data: member } = await supabase
        .from("household_members")
        .select("household_id, user_id, role, joined_at")
        .eq("user_id", user!.id)
        .limit(1)
        .single();

      if (!member) {
        setIsLoading(false);
        return;
      }

      setMembership(member as HouseholdMember);

      const { data: hh } = await supabase
        .from("households")
        .select("*")
        .eq("id", member.household_id)
        .single();

      if (hh) setHousehold(hh as Household);
      setIsLoading(false);
    }

    fetchHousehold();
  }, [user]);

  return { household, membership, isLoading };
}
