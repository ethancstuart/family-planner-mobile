import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// AsyncStorage's native module throws at import time if the dev client
// doesn't have it linked. Use dynamic require with fallback to in-memory.
let nativeStorage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} | null = null;

try {
  const mod = require("@react-native-async-storage/async-storage");
  nativeStorage = mod.default ?? mod;
} catch {
  console.warn(
    "AsyncStorage native module unavailable — using in-memory storage. Rebuild dev client to fix."
  );
}

const memoryStore = new Map<string, string>();

const StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (nativeStorage) return nativeStorage.getItem(key);
    return memoryStore.get(key) ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (nativeStorage) return nativeStorage.setItem(key, value);
    memoryStore.set(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (nativeStorage) return nativeStorage.removeItem(key);
    memoryStore.delete(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: StorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
