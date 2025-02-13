"use client";

import { useContext } from "react";
import { SessionContext } from "@/context/SessionContext";

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  const { token, user, loading } = context;
  let status: "loading" | "authenticated" | "unauthenticated";

  if (loading) status = "loading";
  else if (token) status = "authenticated";
  else status = "unauthenticated";

  const session = token ? { token, user } : null;

  return { data: session, status };
}
