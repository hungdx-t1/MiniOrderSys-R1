"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  username: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  hasHydrated: boolean;
}

const TOKEN_STORAGE_KEY = "mini-order-token";
const USER_STORAGE_KEY = "mini-order-user";
const ROLE_STORAGE_KEY = "mini-order-role";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);

    if (savedToken && savedUser && savedRole) {
      setUser({
        username: savedUser,
        role: savedRole,
        token: savedToken,
      });
    }
    setHasHydrated(true);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, userData.token);
    window.localStorage.setItem(USER_STORAGE_KEY, userData.username);
    window.localStorage.setItem(ROLE_STORAGE_KEY, userData.role);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        hasHydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
