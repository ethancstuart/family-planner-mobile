import { supabase } from "./supabase";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

/**
 * Make an authenticated request to the Next.js API routes.
 * Passes the Supabase JWT as a Bearer token.
 * Automatically retries once on 401 after refreshing the session.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  const doFetch = (token: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

  let res = await doFetch(session.access_token);

  // Retry once on 401 after refreshing the session
  if (res.status === 401) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    if (refreshed.session?.access_token) {
      res = await doFetch(refreshed.session.access_token);
    }
    if (res.status === 401) {
      throw new Error("Not authenticated");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  return res.json();
}
