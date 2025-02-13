"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

interface SessionContextType {
  token: string | null;
  user: any | null;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      Cookies.set("token", newToken, { expires: 7 });
    } else {
      Cookies.remove("token");
    }
    setTokenState(newToken);
  };

  const setUser = (newUser: any | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    setUserState(newUser);
  };

  useEffect(() => {
    const storedToken = Cookies.get("token") || null;
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setTokenState(storedToken);
    }
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user.", error);
      }
    }
    setLoading(false);
  }, []);

  return (
    <SessionContext.Provider value={{ token, user, setToken, setUser, loading }}>{children}</SessionContext.Provider>
  );
}

export { SessionContext };
