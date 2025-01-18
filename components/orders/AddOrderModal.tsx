"use client";

import { X, Upload, Link as LinkIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { Role } from "@prisma/client";
import { useApp } from "@/providers/AppProvider";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: Role;
  onOrderAdded?: () => Promise<void>;
}

export default function AddOrderModal({
  isOpen,
  onClose,
  userRole = "CUSTOMER",
  onOrderAdded,
}: AddOrderModalProps) {
  const { user } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; phoneNumber: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        dropdownRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCustomers = async (
    searchQuery: string,
    pageNum: number,
    append = false
  ) => {
    try {
      setIsLoadingCustomers(true);
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/users?role=CUSTOMER&search=${searchQuery}&page=${pageNum}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCustomers((prev) =>
          append ? [...prev, ...data.users] : data.users
        );
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers(searchTerm, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle initial load and infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasMore &&
      !isLoadingCustomers
    ) {
      setPage((prev) => prev + 1);
      fetchCustomers(searchTerm, page + 1, true);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    size: "",
    color: "",
    quantity: 1,
    price: 0,
    productLink: "",
    notes: "",
    customer: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // For admin/worker roles, customer selection is required
      if (
        (userRole === "ADMIN" || userRole === "WORKER") &&
        !formData.customer
      ) {
        // if no customer is selected
        // add current user to customer data
        formData.customer = user!.id.toString();
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImage,
          userId: formData.customer || undefined, // Use selected customer ID or undefined for regular users
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Success
      onClose();
      if (onOrderAdded) {
        await onOrderAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg pointer-events-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Order
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Fill in the details below
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Image Upload */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                ${
                  dragActive
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-gray-300 dark:border-gray-600"
                }
                ${uploadedImage ? "border-success bg-success/5" : ""}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={uploadedImage}
                    alt="Uploaded product"
                    fill
                    className="object-contain rounded-xl"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Drop your image here, or{" "}
                      <label className="text-primary font-medium cursor-pointer hover:underline">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {(userRole === "ADMIN" || userRole === "WORKER") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Customer
                  </label>
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search customers..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    />
                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-lg z-[60]"
                        onScroll={handleScroll}
                      >
                        {customers.map((customer) => (
                          <div
                            key={customer.id}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                customer: customer.id,
                              }));
                              setIsDropdownOpen(false);
                              setSearchTerm(customer.name);
                            }}
                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              formData.customer === customer.id
                                ? "bg-primary/10 dark:bg-primary/20"
                                : ""
                            }`}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.phoneNumber}
                            </div>
                          </div>
                        ))}
                        {isLoadingCustomers && (
                          <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                            Loading...
                          </div>
                        )}
                        {!isLoadingCustomers &&
                          customers.length === 0 &&
                          searchTerm && (
                            <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                              No customers found
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Product Link
                </label>
                <div className="relative">
                  <input
                    type="url"
                    name="productLink"
                    value={formData.productLink}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    placeholder="https://example.com/product"
                  />
                  <LinkIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Size
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    placeholder="42"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    placeholder="White/Gray"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all resize-none text-sm"
                  placeholder="Add any additional notes here..."
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.productLink}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-orange-600/90 rounded-xl active:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Order"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
