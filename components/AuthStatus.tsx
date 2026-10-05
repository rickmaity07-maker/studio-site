"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

/** Shows an "Admin" link to the signed-in owner; visitors never need an account. */
export function AuthStatus() {
  const { loading, isAdmin } = useAuth();

  if (loading || !isAdmin) return null;

  return (
    <Link href="/admin" className="text-live transition hover:text-text">
      Admin
    </Link>
  );
}
