"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, Truck } from "lucide-react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

interface ReportData {
  orders: {
    totalOrders: number;
  };
  financial: {
    totalRevenue: number;
    shippingCosts: {
      shippingPrice: number;
      localShippingPrice: number;
    };
  };
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden rounded-xl ${gradient} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl`}
  >
    <div className="relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
    <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
  </motion.div>
);

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const response = await fetch(
          `/api/reports?startDate=${dateRange.start}&endDate=${dateRange.end}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
      setLoading(false);
    };

    fetchReports();
  }, [dateRange]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header with Date Range Selection */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          Reports
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start:
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              End:
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </motion.div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Orders"
          value={reportData?.orders?.totalOrders || 0}
          icon={Package}
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
        />

        <StatCard
          title="Total Revenue"
          value={`$${
            reportData?.financial?.totalRevenue?.toFixed(2) || "0.00"
          }`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500 to-blue-700"
        />

        <StatCard
          title="Shipping Cost"
          value={`$${
            reportData?.financial?.shippingCosts?.shippingPrice?.toFixed(2) ||
            "0.00"
          }`}
          icon={Truck}
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />

        <StatCard
          title="Local Shipping"
          value={`$${
            reportData?.financial?.shippingCosts?.localShippingPrice?.toFixed(
              2
            ) || "0.00"
          }`}
          icon={Package}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
        />
      </div>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex h-64 items-center justify-center"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-lg" />
        </motion.div>
      )}
    </div>
  );
}
