"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Package,
  Eye,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Truck,
  Box,
  XCircle,
  CheckCheck,
} from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface Order {
  id: number;
  title: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
  status: string;
  productLink: string;
  imageUrl: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    phoneNumber: string;
  };
  statusHistory: {
    status: string;
    createdAt: string;
    user: {
      name: string;
    };
  }[];
}

const statusColors = {
  PENDING: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-500",
    dot: "bg-yellow-500",
    ring: "ring-yellow-500",
    icon: Clock,
  },
  PROCESSING: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
    ring: "ring-blue-500",
    icon: ShoppingCart,
  },
  PURCHASED: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-700 dark:text-pink-500",
    dot: "bg-pink-500",
    ring: "ring-pink-500",
    icon: CheckCircle2,
  },
  SHIPPED: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
    ring: "ring-purple-500",
    icon: Truck,
  },
  DELIVERED: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
    ring: "ring-green-500",
    icon: Box,
  },
  CANCELLED: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-500",
    dot: "bg-red-500",
    ring: "ring-red-500",
    icon: XCircle,
  },
  CONFIRMED: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-500",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500",
    icon: CheckCheck,
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order #{order.id}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Created At: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* TODO: Make buttons functional */}
        {/* <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <Printer className="h-4 w-4" />
            Print Label
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90">
            <Edit className="h-4 w-4" />
            Edit Order
          </button>
        </div> */}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Product Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                {order.imageUrl ? (
                  <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                    <Image
                      src={order.imageUrl}
                      alt={order.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {order.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {order.size && (
                      <span className="inline-flex items-center rounded-xl bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        Size: {order.size}
                      </span>
                    )}
                    {order.color && (
                      <span className="inline-flex items-center rounded-xl bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        Color: {order.color}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-xl bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                      Quantity: {order.quantity}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={order.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Product
                    </a>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    ${order.price.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Per Unit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Price Breakdown
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      $
                      {(
                        order.price * order.quantity +
                        order.shippingPrice * order.quantity +
                        order.localShippingPrice * order.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info & Timeline */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Customer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white">
                    {order.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {order.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.user.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Status Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gray-200 dark:before:bg-gray-700">
                {order.statusHistory?.map((status, index) => {
                  const colors =
                    statusColors[status.status as keyof typeof statusColors] ||
                    statusColors.PENDING;
                  const StatusIcon = colors.icon;
                  return (
                    <div
                      key={index}
                      className="relative flex items-center gap-4"
                    >
                      <div
                        className={`absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-2 ${colors.ring} dark:bg-gray-800`}
                      >
                        <StatusIcon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div
                        className={`ml-12 rounded-xl ${colors.bg} px-4 py-3`}
                      >
                        <h3 className={`font-medium ${colors.text}`}>
                          {status.status}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            By {status.user.name}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">
                            •
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {new Date(status.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
