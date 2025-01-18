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
  MoreVertical,
  Eye,
  Edit,
} from "lucide-react";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { Skeleton } from "@/components/ui/skeleton";
import AddOrderModal from "@/components/orders/AddOrderModal";
import Cookies from "js-cookie";
import Image from "next/image";
import EditOrderModal from "@/components/orders/EditOrderModal";
import { useApp } from "@/providers/AppProvider";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PURCHASED"
  | "SHIPPED"
  | "DELIVERED"
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

function ActionsCell({
  row,
  setSelectedOrder,
  onEditOrder,
  isAdmin,
}: {
  row: Row<Order>;
  setSelectedOrder: (order: Order | null) => void;
  onEditOrder: (order: Order) => void;
  isAdmin: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-[100] mt-1 w-48 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1">
            <button
              onClick={() => {
                setSelectedOrder(row.original);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  onEditOrder(row.original);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
                Edit Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const { user } = useApp();
  const isAdmin = user?.role === "ADMIN" || user?.role === "WORKER";

  // Function to refresh orders
  const refreshOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        await refreshOrders();
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

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
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="font-medium dark:text-gray-300">
            {info.getValue()}
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
          onEditOrder={setSelectedOrderForEdit}
          isAdmin={isAdmin}
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
        onOrderAdded={refreshOrders}
        userRole={user?.role}
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
    </div>
  );
}
