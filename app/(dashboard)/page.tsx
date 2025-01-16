import DashboardLayout from "@/components/DashboardLayout";
import { Activity, Users, Folder, DollarSign, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid gap-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Users Card */}
          <div className="group p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <h3 className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  Total Users
                </h3>
              </div>
              <div className="mt-2">
                <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  1,234
                </p>
                <p className="text-[10px] lg:text-xs text-primary">
                  ↑ 12% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Active Projects Card */}
          <div className="group p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Folder className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                </div>
                <h3 className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  Projects
                </h3>
              </div>
              <div className="mt-2">
                <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  42
                </p>
                <p className="text-[10px] lg:text-xs text-secondary">
                  ↑ 8% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="group p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                </div>
                <h3 className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  Revenue
                </h3>
              </div>
              <div className="mt-2">
                <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  $52,000
                </p>
                <p className="text-[10px] lg:text-xs text-primary">
                  ↑ 15% from last month
                </p>
              </div>
            </div>
          </div>

          {/* Tasks Card */}
          <div className="group p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                </div>
                <h3 className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                  Tasks
                </h3>
              </div>
              <div className="mt-2">
                <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                  89%
                </p>
                <p className="text-[10px] lg:text-xs text-secondary">
                  ↑ 5% from last month
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 lg:p-4">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-3">
            Recent Activity
          </h2>
          <div className="space-y-2 lg:space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-white truncate">
                    New project &quot;Dashboard UI&quot; created
                  </p>
                  <p className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 lg:p-4">
          <h2 className="text-sm lg:text-base font-semibold text-gray-900 dark:text-white mb-3">
            Monthly Statistics
          </h2>
          <div className="h-40 lg:h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              Chart Placeholder
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
