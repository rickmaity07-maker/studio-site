"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { api } from "@/lib/admin-api";

type AuthState = {
  loading: boolean;
  isAdmin: boolean;
  email: string | null;
  /** Re-checks the session, e.g. right after signing in. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  isAdmin: false,
  email: null,
  refresh: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState({ loading: true, isAdmin: false, email: null as string | null });

  // Admin status is decided server-side from the httpOnly session cookie.
  const refresh = useCallback(async () => {
    const me = await api<{ isAdmin: boolean; email: string | null }>("/api/admin/me").catch(() => null);
    setSession({ loading: false, isAdmin: Boolean(me?.isAdmin), email: me?.email ?? null });
  }, []);

  const signOut = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSession({ loading: false, isAdmin: false, email: null });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ ...session, refresh, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
