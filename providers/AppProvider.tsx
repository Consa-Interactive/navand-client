"use client";

import { type User } from "@prisma/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      Cookies.remove("token");
      setUser(null);
      throw error;
    }
  };

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    refreshUser();
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      await fetchUser(token);
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
