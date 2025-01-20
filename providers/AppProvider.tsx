"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Order } from "@prisma/client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface AppContextType {
  user: User | null;
  orders: Order[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  orderUpdates: boolean;
  setOrderUpdates: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (orderUpdates) {
      // Reset after triggering refresh
      setTimeout(() => setOrderUpdates(false), 100);
    }
  }, [orderUpdates]);

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

  const fetchOrders = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 7 });
    refreshUser();
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setOrders([]);
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

  // Fetch orders when user changes or orderUpdates is triggered
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, orderUpdates]);

  // Initial auth check
  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    orders,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    orderUpdates,
    setOrderUpdates,
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
