"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { SessionContext } from "@/context/SessionContext";

export function useLogout() {
  const router = useRouter();
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useLogout must be used within a SessionProvider");
  }

  const { setToken, setUser } = context;

  const logout = () => {
    setToken(null);
    setUser(null);

    router.push("/");
  };

  return logout;
}
