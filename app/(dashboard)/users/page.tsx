"use client";

import { useState, useEffect } from "react";
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
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
  Phone,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import UserEditModal from "@/components/users/UserEditModal";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "User" | "Manager" | "Editor";
  status: "Active" | "Inactive" | "Pending";
  location: string;
  joinDate: string;
  avatar?: string;
}

const roleColors = {
  Admin: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-500",
    dot: "bg-purple-500",
  },
  User: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-500",
    dot: "bg-blue-500",
  },
  Manager: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-700 dark:text-orange-500",
    dot: "bg-orange-500",
  },
  Editor: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
  },
};

const statusColors = {
  Active: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-500",
    dot: "bg-green-500",
  },
  Inactive: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-500",
    dot: "bg-gray-500",
  },
  Pending: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-500",
    dot: "bg-yellow-500",
  },
};

const generateMockUsers = (count: number): User[] => {
  const names = [
    "John Smith",
    "Emma Davis",
    "Michael Brown",
    "Sarah Wilson",
    "David Miller",
    "Lisa Anderson",
    "James Taylor",
    "Jennifer White",
    "Robert Johnson",
    "Maria Garcia",
  ];

  const locations = [
    "New York, USA",
    "London, UK",
    "Paris, France",
    "Tokyo, Japan",
    "Berlin, Germany",
    "Sydney, Australia",
    "Toronto, Canada",
    "Dubai, UAE",
    "Singapore",
    "Amsterdam, Netherlands",
  ];

  const roles: User["role"][] = ["Admin", "User", "Manager", "Editor"];
  const statuses: User["status"][] = ["Active", "Inactive", "Pending"];

  return Array.from({ length: count }, (_, index) => {
    const name = names[Math.floor(Math.random() * names.length)];
    const email = name.toLowerCase().replace(" ", ".") + "@example.com";
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365));

    return {
      id: `USER${10000 + index}`,
      name,
      email,
      phone: `+1 ${Math.floor(Math.random() * 1000)}-${Math.floor(
        Math.random() * 1000
      )}-${Math.floor(Math.random() * 10000)}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      joinDate: joinDate.toISOString(),
      avatar: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDk_071dbbz-bewOvpfYa3IlyImYtpvQmluw&s`,
    };
  });
};

const columnHelper = createColumnHelper<User>();

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export default function UsersPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
            <Image
              src={info.row.original.avatar || ""}
              width={40}
              height={40}
              alt={info.getValue()}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </div>
            <div className="text-sm text-gray-500">
              {info.row.original.email}
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 ${roleColors[role].bg}`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${roleColors[role].dot}`}
              />
              <span className={`text-xs font-medium ${roleColors[role].text}`}>
                {role}
              </span>
            </div>
          </div>
        );
      },
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
    columnHelper.accessor("location", {
      header: "Location",
      cell: (info) => (
        <div className="flex items-center gap-2 text-gray-500">
          <MapPin className="h-4 w-4" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      cell: (info) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Phone className="h-4 w-4" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("joinDate", {
      header: "Join Date",
      cell: (info) => (
        <div className="text-gray-500">
          {formatDate(new Date(info.getValue()))}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(row.original);
            }}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      ),
    }),
  ];

  useEffect(() => {
    setLoading(true);
    try {
      setUsers(generateMockUsers(100));
    } finally {
      setLoading(false);
    }
  }, []);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
    onSortingChange: setSorting as OnChangeFn<SortingState>,
    onGlobalFilterChange: setGlobalFilter,
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
                    <Skeleton className="h-10 w-10 rounded-full" />
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
          Users
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-orange-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

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
                  className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
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

      <UserEditModal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
      />
    </div>
  );
}
