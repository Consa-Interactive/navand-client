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
  Eye,
  Edit,
  DollarSign,
  CheckCircle,
  FileText,
} from "lucide-react";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";
import AddOrderModal from "@/components/orders/AddOrderModal";
import Cookies from "js-cookie";
import Image from "next/image";
import EditOrderModal from "@/components/orders/EditOrderModal";
import { useApp } from "@/providers/AppProvider";
import SetPriceModal from "@/components/orders/SetPriceModal";
import OrderActionModal from "@/components/orders/OrderActionModal";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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
  setSelectedOrder,
  onEditOrder,
  isAdmin,
  setSelectedOrderForPrice,
  setSelectedOrderForAction,
  refreshOrders,
}: {
  row: Row<Order>;
  setSelectedOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  isAdmin: boolean;
  setSelectedOrderForPrice: (order: Order) => void;
  setSelectedOrderForAction: (order: Order) => void;
  refreshOrders: () => Promise<void>;
}) => {
  const order = row.original;
  const canSetPrice = isAdmin && order.status === "PENDING";
  const canConfirmOrder = order.status === "PROCESSING";
  const canTogglePrepaid = isAdmin && order.status !== "CANCELLED";

  const handlePrepaidClick = async () => {
    try {
      const token = Cookies.get("token");
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

      if (!response.ok) {
        throw new Error("Failed to update prepaid status");
      }

      // Refresh orders instead of reloading the page
      await refreshOrders();
    } catch (error) {
      console.error("Error updating prepaid status:", error);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => setSelectedOrder(order)}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
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
          className="rounded-lg p-2 text-blue-400 hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-900/20"
          title="Set Prices"
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
          onClick={handlePrepaidClick}
          className={`rounded-lg p-2 ${
            order.prepaid
              ? "text-indigo-400 hover:bg-indigo-100 hover:text-indigo-500 dark:hover:bg-indigo-900/20"
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

export default function OrdersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pageSize, setPageSize] = useState(25);
  const [orders, setOrders] = useState<Order[]>([]);
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
  const { user, orderUpdates } = useApp();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WORKER";
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const router = useRouter();

  // Function to refresh orders
  const refreshOrders = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      if (!token) return;

      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh on orderUpdates change
  useEffect(() => {
    refreshOrders();
  }, [orderUpdates]);

  // Debounce search term
  useEffect(() => {
    setSearchLoading(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter orders based on search term
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => advancedSearch(order, debouncedSearchTerm));
  }, [orders, debouncedSearchTerm]);

  const columns = [
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {info.row.original.imageUrl ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-900">
                <Image
                  src={info.row.original.imageUrl}
                  alt={info.getValue()!}
                  className="h-full w-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <span className="font-medium dark:text-gray-300">
              {info.getValue()}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.row.original.size && (
              <span className="inline-flex items-center rounded-xl bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                Size: {info.row.original.size}
              </span>
            )}
            {info.row.original.color && (
              <span className="inline-flex items-center rounded-xl bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                Color: {info.row.original.color}
              </span>
            )}
            <span className="inline-flex items-center rounded-xl bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
              Qty: {info.row.original.quantity}
            </span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("user", {
      header: "Customer",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
              {info
                .getValue()
                .name.split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <div className="font-medium dark:text-gray-300">
              {info.getValue().name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {info.getValue().phoneNumber}
            </div>
          </div>
        </div>
      ),
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
      cell: (info) => {
        const order = info.row.original;
        const subtotal = order.price * order.quantity;
        const shipping = order.shippingPrice * order.quantity;
        const localShipping = order.localShippingPrice * order.quantity;
        const total = subtotal + shipping + localShipping;

        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900 dark:text-white">
              ${total.toFixed(2)}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors = statusColors[status as keyof typeof statusColors];
        return (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {status}
          </div>
        );
      },
    }),

    columnHelper.accessor("createdAt", {
      header: "Date",
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="text-sm text-gray-500 dark:text-gray-200">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell
          row={row}
          setSelectedOrder={setSelectedOrder}
          onEditOrder={(order) => setSelectedOrderForEdit(order)}
          isAdmin={isAdmin}
          setSelectedOrderForPrice={setSelectedOrderForPrice}
          setSelectedOrderForAction={setSelectedOrderForAction}
          refreshOrders={refreshOrders}
        />
      ),
    }),
  ];

  const table = useReactTable({
    data: filteredOrders,
    columns,
    state: {
      sorting,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Orders
        </h1>

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

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={
                        orders.length > 0 &&
                        selectedOrders.length === orders.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map((order) => order.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Select All
                    </span>
                  </div>
                </th>
                {table.getFlatHeaders().map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-200 bg-gray-50/50 px-4 py-3 font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
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
            <tbody>
              {searchLoading
                ? // Search loading skeleton
                  Array.from({ length: 10 }).map((_, rowIndex) => (
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
                  ))
                : // Actual table rows
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-200 last:border-none hover:bg-gray-50/50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedOrders.includes(row.original.id)}
                          onChange={() => handleOrderSelect(row.original.id)}
                        />
                      </td>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {[5, 10, 25, 50, 100, 200, 300, 500].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">
                  {table.getState().pagination.pageIndex * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
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
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onOrderCreated={refreshOrders}
      />

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder as Order}
        />
      )}

      {/* Edit Order Modal */}
      {selectedOrderForEdit && isAdmin && (
        <EditOrderModal
          isOpen={true}
          onClose={() => setSelectedOrderForEdit(null)}
          order={selectedOrderForEdit as Order}
          onOrderUpdated={refreshOrders}
        />
      )}

      {selectedOrderForPrice && (
        <SetPriceModal
          isOpen={!!selectedOrderForPrice}
          onClose={() => setSelectedOrderForPrice(null)}
          order={selectedOrderForPrice}
          onOrderUpdated={fetchOrders}
        />
      )}

      {selectedOrderForAction && (
        <OrderActionModal
          isOpen={!!selectedOrderForAction}
          onClose={() => setSelectedOrderForAction(null)}
          order={selectedOrderForAction}
          onOrderUpdated={fetchOrders}
        />
      )}

      {/* Floating Invoice Button */}
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
    </div>
  );
}
