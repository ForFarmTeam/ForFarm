"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

  // Save or remove token from localStorage accordingly
  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setTokenState(newToken);
  };

  // Save or remove user from localStorage accordingly
  const setUser = (newUser: any | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    setUserState(newUser);
  };

  // On mount, check localStorage for token and user data
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
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
