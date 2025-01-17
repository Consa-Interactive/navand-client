"use client";

import { useApp } from "@/providers/AppProvider";
import {
  User,
  Shield,
  Camera,
  Lock,
  Bell,
  Edit3,
  Package,
  Clock,
  ChevronRight,
  Truck,
  MapPin,
  Heart,
  Star,
  Settings,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for last 5 orders - Replace this with actual API call
  const lastOrders = [
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
      status: "In Transit",
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
    {
      id: "ORD004",
      date: "2024-01-10",
      status: "Delivered",
      total: "$65.00",
      items: 1,
    },
    {
      id: "ORD005",
      date: "2024-01-08",
      status: "Delivered",
      total: "$175.25",
      items: 3,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "in transit":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 relative">
            <button className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all duration-200 backdrop-blur-sm flex items-center gap-2 hover:gap-3 group">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">Change Cover</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:-mt-20 gap-6">
              {/* Avatar */}
              <div className="relative flex-none">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-white dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 overflow-hidden">
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
                  </div>
                </div>
                <button className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-gray-900/60 hover:bg-gray-900/80 text-white transition-all duration-200 backdrop-blur-sm">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                    {user?.role}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white dark:text-primary dark:hover:text-white transition-all duration-200 gap-2 group"
                  >
                    <Edit3 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Status
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Account Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        user?.isActive
                          ? "bg-green-500"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Account Statistics
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lastOrders.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Orders
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Truck className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lastOrders.filter((o) => o.status === "Delivered").length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delivered
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.address ? "1" : "0"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Saved Address
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    0
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Wishlist
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Actions
              </h2>
              <div className="mt-6 space-y-3">
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Lock className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Change Password</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Bell className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Notification Settings</span>
                </button>
                <button className="w-full px-4 py-3 text-sm font-medium rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left flex items-center gap-3 group">
                  <Shield className="w-4 h-4 text-primary transition-transform group-hover:scale-110" />
                  <span>Privacy Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={user?.phoneNumber || ""}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={user?.email || ""}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    City
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={user?.city || ""}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={user?.country || ""}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Address
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={user?.address || ""}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Recent Orders
                </h2>
                <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                  View All Orders
                </button>
              </div>

              <div className="space-y-4">
                {lastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
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

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.total}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.items} items
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {order.status}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
