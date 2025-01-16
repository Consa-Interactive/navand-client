"use client";

import {
  Home,
  Users,
  Settings,
  BarChart2,
  Folder,
  Calendar,
  Package,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuCategories = [
    {
      name: "Main",
      items: [
        { icon: Home, label: "Dashboard", href: "/" },
        { icon: Package, label: "Orders", href: "/orders" },
      ],
    },
    {
      name: "Management",
      items: [
        { icon: Users, label: "Users", href: "/users" },
        { icon: Folder, label: "Projects", href: "/projects" },
      ],
    },
    {
      name: "Tools",
      items: [
        { icon: Calendar, label: "Calendar", href: "/calendar" },
        { icon: BarChart2, label: "Analytics", href: "/analytics" },
        { icon: Settings, label: "Settings", href: "/settings" },
      ],
    },
  ];

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-gray-900 text-gray-200 hover:bg-gray-800 transition-colors"
      aria-label="Toggle Menu"
    >
      {isMobileMenuOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <Menu className="w-5 h-5" />
      )}
    </button>
  );

  const sidebarContent = (
    <nav className="h-full flex flex-col relative">
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
              <p className="text-sm font-medium text-gray-200">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  if (!isMounted) return null;

  return (
    <>
      <MobileMenuButton />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:fixed inset-y-0 left-0 z-40
          w-64 bg-gray-900 text-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />
        {sidebarContent}
      </aside>
    </>
  );
}
