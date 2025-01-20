"use client";

import { useApp } from "@/providers/AppProvider";
import {
  Home,
  Users,
  Settings,
  Package,
  ChevronRight,
  User,
  BarChart2,
  Megaphone,
  Image,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  onMobileClose?: () => void;
}

type MenuSubItem = {
  icon: React.ComponentType<Record<string, unknown>>;
  label: string;
  href: string;
};

type MenuItem = {
  name: string;
  items: MenuSubItem[];
};

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useApp();
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuCategories: MenuItem[] = [
    {
      name: "MAIN",
      items: [
        { icon: Home, label: "Dashboard", href: "/" },
        { icon: Package, label: "Orders", href: "/orders" },
      ],
    },
    {
      name: "MANAGEMENT",
      items: [
        ...(user?.role === "ADMIN" || user?.role === "WORKER"
          ? [
              { icon: Users, label: "Users", href: "/users" },
              {
                icon: Megaphone,
                label: "Announcements",
                href: "/announcements",
              },
              {
                icon: Image,
                label: "Banners",
                href: "/banners",
              },
              {
                icon: BarChart2,
                label: "Reports",
                href: "/reports",
              },
            ]
          : []),
        { icon: BarChart2, label: "My Stats", href: "/stats" },
      ],
    },
    {
      name: "TOOLS",
      items: [
        { icon: User, label: "Profile", href: "/profile" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ],
    },
  ];

  if (!isMounted) return null;

  return (
    <nav className="relative flex h-full flex-col bg-gray-900 text-gray-200">
      {/* Logo Section with enhanced styling */}
      <div className="border-b border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
        <h1 className="flex items-center text-xl font-bold">
          <span className="mr-3 rounded-lg bg-primary p-2 text-white">NE</span>
          Navand Express
        </h1>
      </div>

      {/* Menu Categories */}
      <div className="scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent flex-1 space-y-1 overflow-y-auto py-6">
        {menuCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <h2 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {category.name}
            </h2>
            {category.items.map((item, itemIndex) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={itemIndex}
                  href={item.href}
                  onClick={() => {
                    // Close mobile menu when link is clicked
                    if (onMobileClose) {
                      onMobileClose();
                    }
                  }}
                  className={`group relative mx-3 flex items-center rounded-lg px-6 py-2 transition-all duration-200
                    ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-lg p-1 transition-transform group-hover:scale-110 ${
                        isActive ? "bg-gray-700" : ""
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${isActive ? "text-primary" : ""}`}
                      />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {/* Hover and Active Indicators */}
                  <ChevronRight
                    className={`absolute right-2 h-4 w-4 transform transition-all
                    ${
                      isActive
                        ? "text-primary opacity-100"
                        : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                    }`}
                  />

                  {isActive && (
                    <div className="absolute right-0 top-1 h-[calc(100%-8px)] w-1 rounded-l-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Account Section with glass effect */}
      <div className="mt-auto border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-3 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 ring-2 ring-gray-700">
              <User className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-200">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
