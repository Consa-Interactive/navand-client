"use client";

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

export default function DashboardPage() {
  const { user } = useApp();

  // Mock data - Replace with actual API calls
  const orderStats = {
    totalOrders: 5,
    totalSpent: 389.97,
    activeOrders: 2,
    deliveredOrders: 3,
  };

  const recentOrders = [
    {
      id: "ORD001",
      date: "2024-01-17",
      status: "Delivered",
      total: "$150.00",
      items: 3,
    },
    {
      id: "ORD002",
      date: "2024-01-15",
      status: "Processing",
      total: "$85.50",
      items: 2,
    },
    {
      id: "ORD003",
      date: "2024-01-12",
      status: "Processing",
      total: "$220.00",
      items: 4,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-500";
      case "processing":
        return "text-yellow-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
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
                  {orderStats.totalOrders}
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
                  ${orderStats.totalSpent}
                </p>
              </div>
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orderStats.activeOrders}
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
                  {orderStats.deliveredOrders}
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
            {recentOrders.map((order) => (
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
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.total}
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
