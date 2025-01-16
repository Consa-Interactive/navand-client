import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#fb923c10_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#fdba7410_1px,transparent_1px)]" />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
