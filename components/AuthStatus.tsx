"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AuthStatus() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" className="transition hover:text-text">
        Log in
      </Link>
    );
  }

  return (
    <Link
      href="/admin"
      className={
        "transition hover:text-text " + (isAdmin ? "text-live" : "")
      }
    >
      Admin
    </Link>
  );
}
