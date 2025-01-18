"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/providers/AppProvider";
import {
  Package,
  DollarSign,
  Clock,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalOrders: number;
    totalSpent: number;
    activeOrders: number;
    deliveredOrders: number;
  };
  recentOrders: {
    id: number;
    title: string;
    status: string;
    total: number;
    items: number;
    createdAt: string;
  }[];
}

export default function DashboardPage() {
  const { user } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) return;

        const response = await fetch("/api/user/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const dashboardData = await response.json();
        setData({
          stats: {
            totalOrders: dashboardData.stats.totalOrders,
            totalSpent: dashboardData.recentOrders.reduce(
              (total: number, order: DashboardData["recentOrders"][0]) =>
                total + order.total,
              0
            ),
            activeOrders: dashboardData.recentOrders.filter(
              (order: DashboardData["recentOrders"][0]) =>
                order.status === "PROCESSING"
            ).length,
            deliveredOrders: dashboardData.stats.deliveredOrders,
          },
          recentOrders: dashboardData.recentOrders,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-500";
      case "PROCESSING":
        return "text-yellow-500";
      case "CANCELLED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PROCESSING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-3.5 h-3.5 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6 lg:mt-0 mt-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Here&apos;s what&apos;s happening with your orders
              </p>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors duration-200"
            >
              View All Orders
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Spent
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${data.stats.totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Processing Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.activeOrders}
                </p>
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Delivered
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.deliveredOrders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
            </div>
            <Link
              href="/orders"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block group"
              >
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.items} items
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </p>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
