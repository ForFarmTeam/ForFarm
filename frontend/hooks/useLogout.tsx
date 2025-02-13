"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { SessionContext } from "@/context/SessionContext";
import Cookies from "js-cookie";

export function useLogout() {
  const router = useRouter();
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useLogout must be used within a SessionProvider");
  }

  const { setToken, setUser } = context;

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");

    setToken(null);
    setUser(null);

    console.log(Cookies.get("token"));
    router.push("/");
  };

  return logout;
}
