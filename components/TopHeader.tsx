import { Bell, Sun, Moon, User, Search, LogOut, Settings } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function TopHeader() {
  const { user, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed lg:static top-0 left-0 right-0 z-20">
      <div className="flex items-center justify-between h-14 lg:h-16 px-3 lg:px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl ml-14 lg:ml-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search..."
              className="block w-full pl-9 lg:pl-10 pr-3 py-1.5 lg:py-2 border border-gray-200 dark:border-gray-700 rounded-xl
                       bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent
                       text-sm transition-colors duration-200"
            />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          <button className="p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 relative group">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 lg:top-1.5 right-1 lg:right-1.5 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-primary rounded-full"></span>
            <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 lg:px-2 py-0.5 bg-primary rounded-full text-[8px] lg:text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
              3
            </span>
          </button>

          <button className="p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300 hidden dark:block" />
            <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600 dark:text-gray-300 block dark:hidden" />
          </button>

          <div
            className="pl-1 lg:pl-2 border-l border-gray-200 dark:border-gray-700 ml-1 lg:ml-2"
            ref={dropdownRef}
          >
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.name}
                </p>
                <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-10 right-2 mt-1 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
