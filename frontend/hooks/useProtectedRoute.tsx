"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

export function useProtectedRoute() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.token) {
      router.push("/signin");
    }
  }, [session?.token, router]);

  return session?.token;
}
