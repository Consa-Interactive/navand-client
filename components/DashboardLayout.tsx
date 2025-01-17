"use client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <main className="min-h-screen">
        <div className="p-3 lg:p-4">{children}</div>
      </main>
    </div>
  );
}
