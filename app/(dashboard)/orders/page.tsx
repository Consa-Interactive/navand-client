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
} from "lucide-react";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import AddOrderModal from "@/components/orders/AddOrderModal";

interface OrderItem {
  id: string;
  title: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
  status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  country: string;
  customerName: string;
  orderDate: string;
  image?: string;
}

type Order = OrderItem;

const statusColors = {
  Confirmed: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
  },
  Processing: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
  },
  Shipped: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
  },
  Delivered: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
  },
  Cancelled: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-500",
    dot: "bg-red-500",
  },
};

const generateMockOrders = (count: number): Order[] => {
  const products = [
    {
      title: "Bershka Çok parçalı spor ayakkabı",
      size: "42",
      color: "White/Gray",
      price: 15.43,
      image:
        "https://cdn.dsmcdn.com/ty1546/product/media/images/ty1550/prod/QC/20240916/10/d968e14b-126c-3657-8183-c13a1d55ca1c/1_org_zoom.jpg",
    },
    {
      title: "Nike Air Max Sneakers",
      size: "43",
      color: "Black/Red",
      price: 129.99,
      image:
        "https://cdn.dsmcdn.com/ty1546/product/media/images/ty1550/prod/QC/20240916/10/d968e14b-126c-3657-8183-c13a1d55ca1c/1_org_zoom.jpg",
    },
    {
      title: "Adidas Ultra Boost",
      size: "41",
      color: "Navy Blue",
      price: 159.99,
      image:
        "https://cdn.dsmcdn.com/ty1546/product/media/images/ty1550/prod/QC/20240916/10/d968e14b-126c-3657-8183-c13a1d55ca1c/1_org_zoom.jpg",
    },
    {
      title: "Puma RS-X",
      size: "44",
      color: "White/Blue",
      price: 89.99,
      image:
        "https://cdn.dsmcdn.com/ty1546/product/media/images/ty1550/prod/QC/20240916/10/d968e14b-126c-3657-8183-c13a1d55ca1c/1_org_zoom.jpg",
    },
    {
      title: "New Balance 574",
      size: "40",
      color: "Gray/White",
      price: 79.99,
      image:
        "https://cdn.dsmcdn.com/ty1546/product/media/images/ty1550/prod/QC/20240916/10/d968e14b-126c-3657-8183-c13a1d55ca1c/1_org_zoom.jpg",
    },
  ];

  const customers = [
    "Chra Sabir",
    "John Smith",
    "Emma Davis",
    "Michael Brown",
    "Sarah Wilson",
  ];

  const countries = ["Turkey", "USA", "UK", "Germany", "France"];

  const statuses: Order["status"][] = [
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return Array.from({ length: count }, (_, index) => {
    const product = products[Math.floor(Math.random() * products.length)];
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

    return {
      id: `${56000 + index}`,
      title: product.title,
      size: product.size,
      color: product.color,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: product.price,
      image: product.image,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      customerName: customers[Math.floor(Math.random() * customers.length)],
      orderDate: orderDate.toISOString(),
    };
  });
};

const columnHelper = createColumnHelper<Order>();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

function ActionsCell({
  row,
  setSelectedOrder,
}: {
  row: Row<Order>;
  setSelectedOrder: (order: Order | null) => void;
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
        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <svg
          className="h-5 w-5 text-gray-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setSelectedOrder(row.original);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              View Details
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                // Add your edit action here
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Edit Order
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                // Add your delete action here
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Delete Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fuzzy search function
function fuzzySearch(searchTerm: string, text: string): boolean {
  const search = searchTerm.toLowerCase();
  const tokens = text.toLowerCase().split("");
  let searchPosition = 0;

  for (const char of tokens) {
    if (char === search[searchPosition]) {
      searchPosition += 1;
      if (searchPosition === search.length) {
        return true;
      }
    }
  }
  return false;
}

// Advanced search function that checks multiple fields
function advancedSearch(order: Order, searchTerm: string): boolean {
  if (!searchTerm) return true;

  const searchableFields = [
    order.id,
    order.title,
    order.customerName,
    order.country,
    order.status,
    order.size,
    order.color,
  ];

  // Split search term by spaces to allow searching for multiple terms
  const searchTerms = searchTerm.toLowerCase().split(" ").filter(Boolean);

  // Check if all search terms match at least one field
  return searchTerms.every((term) =>
    searchableFields.some((field) => {
      if (!field) return false;
      return (
        field.toLowerCase().includes(term) || // Exact match
        fuzzySearch(term, field) // Fuzzy match
      );
    })
  );
}

export default function OrdersPage() {
  const [sorting, setSorting] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pageSize, setPageSize] = useState(25);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
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
            className="rounded border-gray-300"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            {info.row.original.image ? (
              <Image
                src={info.row.original.image}
                alt={info.getValue()}
                width={40}
                height={40}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-6 w-6 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {info.row.original.size && (
                <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Size: {info.row.original.size}
                </div>
              )}
              {info.row.original.color && (
                <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {info.row.original.color}
                </div>
              )}
              <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Qty: {info.row.original.quantity}
              </div>
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("country", {
      header: "Country",
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("customerName", {
      header: "Customer",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800">
            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {info
                .getValue()
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div className="font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${statusColors[status].bg}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${statusColors[status].dot}`}
              />
              <span
                className={`text-xs font-medium ${statusColors[status].text}`}
              >
                {status}
              </span>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("orderDate", {
      header: "Order Date",
      cell: (info) => {
        const date = new Date(info.getValue());
        const formattedDate = formatDate(date);
        const [datePart, timePart] = formattedDate.split(",");
        return (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {datePart.trim()}
            </div>
            <div className="text-xs text-gray-500">{timePart.trim()}</div>
          </div>
        );
      },
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          ${info.getValue().toFixed(2)}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <ActionsCell row={row} setSelectedOrder={setSelectedOrder} />
      ),
    }),
  ];

  useEffect(() => {
    setLoading(true);
    try {
      setOrders(generateMockOrders(10000));
    } finally {
      setLoading(false);
    }
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <div className="min-h-[400px] p-4">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Orders
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:min-w-[300px]">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by ID, title, customer, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-orange-600/90 rounded-xl active:bg-primary/95 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          >
            <Plus className="w-5 h-5" />
            Add Order
          </button>
        </div>
      </div>

      {/* Show "No results found" message when search yields no results */}
      {filteredOrders.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No results found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search term or filters
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-900/50 dark:text-gray-400"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => setSelectedOrder(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-6 py-4">
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
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
          <div className="flex flex-1 items-center justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-baseline gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * pageSize,
                    table.getFilteredRowModel().rows.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                results
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Show
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {[25, 50, 75, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  entries
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
        />
      )}

      {/* Add Order Modal */}
      <AddOrderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userRole="customer"
      />
    </div>
  );
}
