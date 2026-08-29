"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, firebaseConfigured } from "@/lib/firebase";
import { isAdmin as checkIsAdmin } from "@/lib/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false
  });

  useEffect(() => {
    if (!firebaseConfigured) {
      setState({ user: null, loading: false, isAdmin: false });
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, loading: false, isAdmin: false });
        return;
      }
      const admin = await checkIsAdmin(user.uid).catch(() => false);
      setState({ user, loading: false, isAdmin: admin });
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
