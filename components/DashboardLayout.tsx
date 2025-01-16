import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ">
        <main className="flex-1 overflow-y-auto p-3 lg:p-4 pt-16 lg:pt-4">
          {/* Breadcrumb - can be dynamic based on route */}
          <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>Home</span>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              Dashboard
            </span>
          </div>

          {/* Content */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] -z-10" />

            {/* Content */}
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto px-3 py-2 lg:py-3">
            <p className="text-[10px] lg:text-sm text-gray-500 dark:text-gray-400 text-center">
              © 2024 Navand Express. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Sidebar - Moved after main content for better mobile handling */}
      <Sidebar />
    </div>
  );
}
