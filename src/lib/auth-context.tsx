import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient, QueryClient } from "@tanstack/react-query";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function AuthProvider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Safety timeout — if INITIAL_SESSION never fires, stop loading
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        clearTimeout(timeout);
        setSession(session);
        setIsLoading(false);
      } else {
        setSession(session);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
