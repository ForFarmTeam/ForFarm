"use client";

import { SessionContext } from "next-auth/react";
import { useContext } from "react";

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
