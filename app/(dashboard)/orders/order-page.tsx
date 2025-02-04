"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  OnChangeFn,
  SortingState,
  Row,
  PaginationState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  X,
  Package,
  Edit,
  DollarSign,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddOrderModal from "@/components/orders/AddOrderModal";
import Cookies from "js-cookie";
import Image from "next/image";
import EditOrderModal from "@/components/orders/EditOrderModal";
import { OrderType, useApp } from "@/providers/AppProvider";
import SetPriceModal from "@/components/orders/SetPriceModal";
import OrderActionModal from "@/components/orders/OrderActionModal";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PURCHASED"
  | "SHIPPED"
  | "DELIVERED"
  | "CONFIRMED"
  | "CANCELLED";

interface OrderItem {
  id: number;
  title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  shippingPrice: number;
  localShippingPrice: number;
  status: OrderStatus;
  country: string;
  productLink: string;
  imageUrl: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  prepaid: boolean;
  invoiceId: number | null;
  user: {
    name: string;
    phoneNumber: string;
  };
}

type Order = OrderItem;

const statusColors = {
  PENDING: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-500",
    dot: "bg-yellow-500",
  },
  PROCESSING: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
  },
  PURCHASED: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    text: "text-pink-700 dark:text-pink-500",
    dot: "bg-pink-500",
  },
  SHIPPED: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
  },
  DELIVERED: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
  },
  CANCELLED: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-500",
    dot: "bg-red-500",
  },
  CONFIRMED: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-500",
    dot: "bg-emerald-500",
  },
  PREPAID: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-700 dark:text-indigo-500",
    dot: "bg-indigo-500",
  },
};

const STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE", color: "emerald" },
  { label: "Pending", value: "PENDING", color: "yellow" },
  { label: "Processing", value: "PROCESSING", color: "blue" },
  { label: "Confirmed", value: "CONFIRMED", color: "emerald" },
  { label: "Purchased", value: "PURCHASED", color: "pink" },
  { label: "In Turkey", value: "RECEIVED_IN_TURKEY", color: "indigo" },
  { label: "Arrived in Erbil", value: "ARRIVED_IN_ERBIL", color: "purple" },
  { label: "Canceled", value: "CANCELLED", color: "red" },
];

const ACTIVE_ORDER_STATUSES = [
  "CONFIRMED",
  "PURCHASED",
  "RECEIVED_IN_TURKEY",
  "ARRIVED_IN_ERBIL",
] as const;

// Function to fetch orders
const fetchOrders = async () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch("/api/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = await response.json();
  return data.map((order: Order) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
  }));
};

// Advanced search function
const advancedSearch = (order: Order, term: string) => {
  if (!term) return true;
  const searchTerm = term.toLowerCase();
  return (
    order.title?.toLowerCase().includes(searchTerm) ||
    order.user.name.toLowerCase().includes(searchTerm) ||
    order.user.phoneNumber.toLowerCase().includes(searchTerm) ||
    order.status.toLowerCase().includes(searchTerm) ||
    order.id.toString().includes(searchTerm)
  );
};

const columnHelper = createColumnHelper<Order>();

const ActionsCell = ({
  row,
  onEditOrder,
  isAdmin,
  setSelectedOrderForAction,
  handlePrepaidClick,
  setSelectedOrderForPrice,
}: {
  row: Row<Order>;
  onEditOrder: (order: Order) => void;
  isAdmin: boolean;
  setSelectedOrderForAction: (order: Order) => void;
  handlePrepaidClick: (order: Order) => Promise<void>;
  setSelectedOrderForPrice: (order: Order) => void;
}) => {
  const router = useRouter();
  const order = row.original;
  const canSetPrice = isAdmin && order.status === "PENDING";
  const canConfirmOrder = isAdmin && order.status === "PROCESSING";
  const canTogglePrepaid = isAdmin && order.status === "CONFIRMED";

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => router.push(`/orders/${order.id}`)}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
        title="View Details"
      >
        <FileText className="h-4 w-4" />
      </button>

      {isAdmin && (
        <button
          onClick={() => onEditOrder(order)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          title="Edit Order"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}

      {canSetPrice && (
        <button
          onClick={() => setSelectedOrderForPrice(order)}
          className="rounded-lg p-2 text-primary hover:bg-primary/10 hover:text-primary/80"
          title="Set Price"
        >
          <DollarSign className="h-4 w-4" />
        </button>
      )}

      {canConfirmOrder && (
        <button
          onClick={() => setSelectedOrderForAction(order)}
          className="rounded-lg p-2 text-green-400 hover:bg-green-100 hover:text-green-500 dark:hover:bg-green-900/20"
          title="Confirm/Reject Order"
        >
          <CheckCircle className="h-4 w-4" />
        </button>
      )}

      {canTogglePrepaid && (
        <button
          onClick={() => handlePrepaidClick(order)}
          className={`rounded-lg p-2 ${
            order.prepaid
              ? "text-primary hover:bg-primary/10 hover:text-primary/80"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          }`}
          title={order.prepaid ? "Mark as Not Prepaid" : "Mark as Prepaid"}
        >
          <DollarSign className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const getStatusButtonClasses = (status: string, isActive: boolean) => {
  const baseClasses =
    "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200";

  if (status === "ALL") {
    return `${baseClasses} ${
      isActive
        ? "bg-gray-900 text-white ring-2 ring-gray-900/20"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;
  }

  const statusClasses = {
    PENDING: {
      active: "bg-yellow-500 text-white ring-2 ring-yellow-500/20",
      inactive: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100",
    },
    PROCESSING: {
      active: "bg-orange-500 text-white ring-2 ring-orange-500/20",
      inactive: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    },
    CONFIRMED: {
      active: "bg-[#4F46E5] text-white ring-2 ring-[#4F46E5]/20",
      inactive: "bg-[#4F46E5]/10 text-[#4F46E5] hover:bg-[#4F46E5]/20",
    },
    PURCHASED: {
      active: "bg-pink-500 text-white ring-2 ring-pink-500/20",
      inactive: "bg-pink-50 text-pink-600 hover:bg-pink-100",
    },
    RECEIVED_IN_TURKEY: {
      active: "bg-indigo-500 text-white ring-2 ring-indigo-500/20",
      inactive: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    },
    IN_TRANSIT: {
      active: "bg-purple-500 text-white ring-2 ring-purple-500/20",
      inactive: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    ARRIVED_ERBIL: {
      active: "bg-cyan-500 text-white ring-2 ring-cyan-500/20",
      inactive: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100",
    },
    DELIVERED: {
      active: "bg-[#22C55E] text-white ring-2 ring-[#22C55E]/20",
      inactive: "bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20",
    },
    CANCELLED: {
      active: "bg-red-500 text-white ring-2 ring-red-500/20",
      inactive: "bg-red-50 text-red-600 hover:bg-red-100",
    },
    ISSUE: {
      active: "bg-rose-500 text-white ring-2 ring-rose-500/20",
      inactive: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    },
  };

  return `${baseClasses} ${
    isActive
      ? statusClasses[status as keyof typeof statusClasses]?.active ||
        statusClasses.PENDING.active
      : statusClasses[status as keyof typeof statusClasses]?.inactive ||
        statusClasses.PENDING.inactive
  }`;
};

const getStatusDotClass = (status: string) => {
  const statusDotClasses = {
    PENDING: "bg-yellow-500",
    PROCESSING: "bg-orange-500",
    CONFIRMED: "bg-[#4F46E5]",
    PURCHASED: "bg-pink-500",
    RECEIVED_IN_TURKEY: "bg-indigo-500",
    IN_TRANSIT: "bg-purple-500",
    ARRIVED_ERBIL: "bg-cyan-500",
    DELIVERED: "bg-[#22C55E]",
    CANCELLED: "bg-red-500",
    ISSUE: "bg-rose-500",
  };

  return `h-2 w-2 rounded-full ${
    statusDotClasses[status as keyof typeof statusDotClasses] || "bg-gray-500"
  }`;
};

const MobileOrderCard = ({
  order,
  isSelected,
  onSelect,
  onEdit,
  onAction,
  isAdmin,
  router,
  handlePrepaidClick,
  setSelectedOrderForPrice,
  setSelectedImage,
}: {
  order: Order;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAction: () => void;
  isAdmin: boolean;
  router: AppRouterInstance;
  handlePrepaidClick: (order: Order) => Promise<void>;
  setSelectedOrderForPrice: (order: Order) => void;
  setSelectedImage: (image: { src: string; alt: string } | null) => void;
}) => {
  const canSetPrice = isAdmin && order.status === "PENDING";
  const canConfirmOrder = isAdmin && order.status === "PROCESSING";
  const canTogglePrepaid = isAdmin && order.status === "CONFIRMED";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Card Header */}
      <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 rounded-md border-gray-300 text-primary shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="font-mono text-sm text-gray-500">#{order.id}</span>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm ${
              statusColors[order.status as keyof typeof statusColors]?.bg
            } ${statusColors[order.status as keyof typeof statusColors]?.text}`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                statusColors[order.status as keyof typeof statusColors]?.dot
              }`}
            />
            {order.status}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-4 p-4">
        {/* Product Info */}
        <div className="flex gap-3">
          {order.imageUrl ? (
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                setSelectedImage({
                  src: order.imageUrl!,
                  alt: order.title,
                })
              }
            >
              <Image
                src={order.imageUrl}
                alt={order.title}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 space-y-1">
            <a
              href={order.productLink}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-1 font-medium text-gray-900 hover:text-primary dark:text-white dark:hover:text-primary"
            >
              {order.title}
            </a>
            <div className="flex flex-wrap gap-1">
              {order.size && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Size: {order.size}
                </span>
              )}
              {order.color && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Color: {order.color}
                </span>
              )}
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Qty: {order.quantity}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {order.user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {order.user.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {order.user.phoneNumber}
            </span>
          </div>
        </div>

        {/* Price and Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-mono text-lg font-medium text-gray-900 dark:text-white">
              ${order.price.toFixed(2)}
            </div>
            {order.prepaid ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20">
                <span className="h-1 w-1 rounded-full bg-green-500"></span>
                PAID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/20">
                <span className="h-1 w-1 rounded-full bg-yellow-500"></span>
                UNPAID
              </span>
            )}
          </div>
          <div className="text-right text-sm">
            <div className="font-medium text-gray-900 dark:text-white">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(order.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <button
          onClick={() => router.push(`/orders/${order.id}`)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          title="View Details"
        >
          <FileText className="h-4 w-4" />
        </button>

        {isAdmin && (
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            title="Edit Order"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}

        {canSetPrice && (
          <button
            onClick={() => setSelectedOrderForPrice(order)}
            className="rounded-lg p-2 text-primary hover:bg-primary/10 hover:text-primary/80"
            title="Set Price"
          >
            <DollarSign className="h-4 w-4" />
          </button>
        )}

        {canConfirmOrder && (
          <button
            onClick={onAction}
            className="rounded-lg p-2 text-green-400 hover:bg-green-100 hover:text-green-500 dark:hover:bg-green-900/20"
            title="Confirm/Reject Order"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}

        {canTogglePrepaid && (
          <button
            onClick={() => handlePrepaidClick(order)}
            className={`rounded-lg p-2 ${
              order.prepaid
                ? "text-primary hover:bg-primary/10 hover:text-primary/80"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            }`}
            title={order.prepaid ? "Mark as Not Prepaid" : "Mark as Prepaid"}
          >
            <DollarSign className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

function ImageModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div className="relative max-h-[80vh] max-w-[80vw] w-[500px] bg-white dark:bg-gray-800 rounded-xl p-4">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 500px) 100vw, 500px"
          />
        </div>
        <button
          onClick={onClose}
          className="absolute -right-3 -top-3 rounded-full bg-white p-1.5 text-gray-500 shadow-lg hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const { orders, setOrders, updateOrder, triggerOrderUpdate } = useApp();
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] =
    useState<Order | null>(null);
  const [selectedOrderForPrice, setSelectedOrderForPrice] =
    useState<Order | null>(null);
  const [selectedOrderForAction, setSelectedOrderForAction] =
    useState<Order | null>(null);
  const { user, orderUpdates: appOrderUpdates } = useApp();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WORKER";
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  // Get status and country from URL
  const activeStatus = searchParams.get("status")?.toUpperCase() || "ALL";
  const activeCountry = searchParams.get("country")?.toUpperCase() || "ALL";

  // Update URL when filters change
  const updateFilters = (status: string, country: string) => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status.toLowerCase());
    if (country !== "ALL") params.set("country", country.toLowerCase());
    router.push(`/orders?${params.toString()}`);
  };

  // Initial fetch
  useEffect(() => {
    const fetchInitialOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialOrders();
  }, [appOrderUpdates, setOrders]);

  // Debounce search term
  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update the filter logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order: OrderType) => {
      const matchesSearch = advancedSearch(
        order as OrderItem,
        debouncedSearchTerm
      );
      const matchesStatus =
        activeStatus === "ALL" ||
        (activeStatus === "ACTIVE"
          ? ACTIVE_ORDER_STATUSES.includes(
              order.status as
                | "CONFIRMED"
                | "PURCHASED"
                | "RECEIVED_IN_TURKEY"
                | "ARRIVED_IN_ERBIL"
            )
          : order.status === activeStatus);
      const matchesCountry =
        activeCountry === "ALL" ||
        order.country?.toUpperCase() === activeCountry;

      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [orders, debouncedSearchTerm, activeStatus, activeCountry]);

  const columns = [
    columnHelper.accessor("id", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order ID
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-gray-500">
            #{info.getValue()}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor("title", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-3 max-w-[400px]">
          {info.row.original.imageUrl ? (
            <div
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                setSelectedImage({
                  src: info.row.original.imageUrl!,
                  alt: info.getValue()!,
                })
              }
            >
              <Image
                src={info.row.original.imageUrl}
                alt={info.getValue()!}
                className="h-full w-full object-cover"
                width={40}
                height={40}
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <a
            href={info.row.original.productLink}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-1 flex-1 text-sm font-medium text-gray-900 hover:text-primary dark:text-white dark:hover:text-primary"
          >
            {info.getValue()}
          </a>
        </div>
      ),
    }),
    columnHelper.accessor("user", {
      header: "Customer",
      cell: (info) => {
        const user = info.getValue();
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {user.phoneNumber}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="font-mono font-medium text-gray-900 dark:text-white">
            ${info.getValue().toFixed(2)}
          </div>
          {info.row.original.prepaid ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20">
              <span className="h-1 w-1 rounded-full bg-green-500"></span>
              PAID
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/20">
              <span className="h-1 w-1 rounded-full bg-yellow-500"></span>
              UNPAID
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => {
        const status = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${
                statusColors[status as keyof typeof statusColors]?.bg
              } ${statusColors[status as keyof typeof statusColors]?.text}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  statusColors[status as keyof typeof statusColors]?.dot
                }`}
              />
              {status}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("country", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Country
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <div
          className="flex cursor-pointer items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="h-4 w-4" />
        </div>
      ),
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          onEditOrder={(order) => setSelectedOrderForEdit(order)}
          isAdmin={isAdmin}
          setSelectedOrderForAction={setSelectedOrderForAction}
          handlePrepaidClick={handlePrepaidClick}
          setSelectedOrderForPrice={setSelectedOrderForPrice}
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredOrders as OrderItem[],
    columns,
    state: {
      sorting,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    onPaginationChange: (
      updater: PaginationState | ((old: PaginationState) => PaginationState)
    ) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Reset page index when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearchTerm, activeStatus, activeCountry]);

  const handleOrderSelect = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          orderIds: selectedOrders,
          paymentMethod: "Cash",
          notes: "Generated from selected orders",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invoice");
      }

      const invoice = await response.json();
      // Clear selections after successful invoice generation
      setSelectedOrders([]);
      // Refresh orders list
      router.refresh();
      // Show success toast
      toast.success("Invoice generated successfully");
      router.push(`/invoices/${invoice.id}`);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate invoice"
      );
    }
  };

  const handlePrepaidClick = async (order: Order) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prepaid: !order.prepaid,
        }),
      });

      if (!response.ok) throw new Error("Failed to update prepaid status");

      const updatedOrder = await response.json();
      updateOrder(updatedOrder);
      toast.success("Order prepaid status updated successfully");
    } catch (error) {
      console.error("Error updating prepaid status:", error);
      toast.error("Failed to update prepaid status");
    }
  };

  // Loading skeleton - Full page on initial load
  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-full sm:w-[300px]" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {[
                    "ID",
                    "Title",
                    "Customer",
                    "Price",
                    "Status",
                    "Country",
                    "Date",
                    "",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="border-b border-gray-200 px-4 py-3 dark:border-gray-700"
                    >
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 last:border-none dark:border-gray-700"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <div className="flex gap-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-24" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-5 w-72" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Orders
          </h1>

          {/* Status Filters */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
            <div className="flex flex-nowrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status.value}
                  onClick={() => updateFilters(status.value, activeCountry)}
                  className={getStatusButtonClasses(
                    status.value,
                    activeStatus === status.value
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={getStatusDotClass(status.value)} />
                    {status.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Add Order */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-2.5 rounded-xl p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600/90 active:bg-primary/95 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Order
            </button>
          </div>
        </div>

        {/* Table/Cards Container */}
        <div className="lg:block hidden">
          {/* Existing table code */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="w-[48px] px-4 py-3">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded-md border-gray-300 text-primary shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700"
                          checked={
                            orders.length > 0 &&
                            selectedOrders.length === orders.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders(
                                orders.map((order: OrderType) => order.id)
                              );
                            } else {
                              setSelectedOrders([]);
                            }
                          }}
                        />
                      </div>
                    </th>
                    {table.getFlatHeaders().map((header) => (
                      <th
                        key={header.id}
                        className="whitespace-nowrap px-4 py-3 font-medium text-gray-500 first:pl-4 last:pr-4 dark:text-gray-400"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchLoading
                    ? // Search loading skeleton
                      Array.from({ length: 10 }).map((_, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="bg-white dark:bg-gray-800"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-xl" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <div className="flex gap-1">
                                  <Skeleton className="h-3 w-16" />
                                  <Skeleton className="h-3 w-16" />
                                  <Skeleton className="h-3 w-16" />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-4 py-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                          </td>
                        </tr>
                      ))
                    : table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="group bg-white transition-colors hover:bg-gray-50/50 dark:bg-gray-800 dark:hover:bg-gray-800/50"
                        >
                          <td className="w-[48px] px-4 py-3">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded-md border-gray-300 text-primary shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700"
                                checked={selectedOrders.includes(
                                  row.original.id
                                )}
                                onChange={() =>
                                  handleOrderSelect(row.original.id)
                                }
                              />
                            </div>
                          </td>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-3 first:pl-4 last:pr-4"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {[5, 10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pageIndex * pageSize + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.min(
                        (pageIndex + 1) * pageSize,
                        table.getFilteredRowModel().rows.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {table.getFilteredRowModel().rows.length}
                    </span>{" "}
                    entries
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPageIndex(pageIndex - 1)}
                    disabled={!table.getCanPreviousPage()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPageIndex(pageIndex + 1)}
                    disabled={!table.getCanNextPage()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {searchLoading
            ? // Mobile loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="flex gap-3">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : table
                .getRowModel()
                .rows.map((row) => (
                  <MobileOrderCard
                    key={row.id}
                    order={row.original}
                    isSelected={selectedOrders.includes(row.original.id)}
                    onSelect={() => handleOrderSelect(row.original.id)}
                    onEdit={() => setSelectedOrderForEdit(row.original)}
                    onAction={() => setSelectedOrderForAction(row.original)}
                    isAdmin={isAdmin}
                    router={router}
                    handlePrepaidClick={handlePrepaidClick}
                    setSelectedOrderForPrice={setSelectedOrderForPrice}
                    setSelectedImage={setSelectedImage}
                  />
                ))}

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0); // Reset to first page when changing page size
              }}
              className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {[5, 10, 25].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={!table.getCanNextPage()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Order Modal */}
        <AddOrderModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onOrderCreated={async () => {
            await triggerOrderUpdate();
          }}
        />

        {/* Edit Order Modal */}
        {selectedOrderForEdit && isAdmin && (
          <EditOrderModal
            isOpen={true}
            onClose={() => setSelectedOrderForEdit(null)}
            order={selectedOrderForEdit as OrderType}
            onOrderUpdated={async () => {
              await triggerOrderUpdate();
            }}
          />
        )}

        {selectedOrderForPrice && (
          <SetPriceModal
            isOpen={!!selectedOrderForPrice}
            onClose={() => setSelectedOrderForPrice(null)}
            order={selectedOrderForPrice as OrderType}
            onOrderUpdated={async () => {
              await triggerOrderUpdate();
            }}
          />
        )}

        {selectedOrderForAction && (
          <OrderActionModal
            isOpen={!!selectedOrderForAction}
            onClose={() => setSelectedOrderForAction(null)}
            order={selectedOrderForAction as OrderType}
            onOrderUpdated={async (updatedOrder: OrderType) => {
              updateOrder(updatedOrder);
              toast.success(
                `Order ${
                  updatedOrder.status === "CONFIRMED" ? "confirmed" : "rejected"
                } successfully`
              );
            }}
          />
        )}

        {/* Floating Invoice Button */}
        {isAdmin && selectedOrders.length > 0 && (
          <AnimatePresence>
            {selectedOrders.length > 0 && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCreateInvoice}
                className="fixed bottom-8 right-8 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-full shadow-lg transition-colors duration-200"
              >
                <FileText className="w-5 h-5" />
                <span>Generate Invoice ({selectedOrders.length})</span>
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage.src}
          alt={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
