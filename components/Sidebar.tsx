"use client";

import { useApp } from "@/providers/AppProvider";
import {
  Home,
  Users,
  Settings,
  Package,
  ChevronRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  onMobileClose?: () => void;
}

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const { user } = useApp();

  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname, onMobileClose]);

  const menuCategories = [
    {
      name: "Main",
      items: [
        { icon: Home, label: "Dashboard", href: "/" },
        { icon: Package, label: "Orders", href: "/orders" },
        // { icon: MapPin, label: "Routes", href: "/routes" }, // TODO: Add routes
        // { icon: CreditCard, label: "Payments", href: "/payments" }, // TODO: Add payments
      ],
    },
    {
      name: "Management",
      items: [
        { icon: Users, label: "Users", href: "/users" }, // TODO: this should be only for admins
        // { icon: Folder, label: "Projects", href: "/projects" }, // TODO: Add projects
      ],
    },
    {
      name: "Tools",
      items: [
        // { icon: Calendar, label: "Calendar", href: "/calendar" },
        // { icon: BarChart2, label: "Analytics", href: "/analytics" }, // TODO: Add analytics
        { icon: User, label: "Profile", href: "/profile" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ],
    },
  ];

  if (!isMounted) return null;

  return (
    <nav className="h-full flex flex-col relative bg-gray-900 text-gray-200">
      {/* Logo Section with enhanced styling */}
      <div className="p-6 border-b border-gray-800 backdrop-blur-sm bg-gray-900/50">
        <h1 className="text-xl font-bold flex items-center">
          <span className="bg-primary p-2 rounded-lg mr-3 text-white">NE</span>
          Navand Express
        </h1>
      </div>

      {/* Menu Categories */}
      <div className="flex-1 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {menuCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <h2 className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-6 mb-2">
              {category.name}
            </h2>
            {category.items.map((item, itemIndex) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={`flex items-center px-6 py-2 mx-3 rounded-lg transition-all duration-200 relative group
                    ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1 rounded-lg transition-transform group-hover:scale-110 ${
                        isActive ? "bg-gray-700" : ""
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                      />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {/* Hover and Active Indicators */}
                  <ChevronRight
                    className={`w-4 h-4 absolute right-2 transition-all transform
                    ${
                      isActive
                        ? "opacity-100 text-primary"
                        : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                    }`}
                  />

                  {isActive && (
                    <div className="absolute right-0 top-1 h-[calc(100%-8px)] w-1 bg-primary rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Account Section with glass effect */}
      <div className="mt-auto border-t border-gray-800 backdrop-blur-sm bg-gray-900/50">
        <div className="p-4 mx-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-gray-800 ring-2 ring-gray-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-300" />
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
