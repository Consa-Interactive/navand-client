"use client";

import { X, Upload, Link as LinkIcon, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "admin" | "worker" | "customer";
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Mock customers data - will be replaced with API call later
const mockCustomers = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Alice Johnson", email: "alice@example.com" },
];

export default function AddOrderModal({
  isOpen,
  onClose,
  userRole = "customer",
}: AddOrderModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<
    (typeof mockCustomers)[0] | null
  >(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

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

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

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
            {/* Customer Selection for Admin/Worker */}
            {(userRole === "admin" || userRole === "worker") && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Customer
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    placeholder="Search customer..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                  />
                  <User className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                </div>

                {/* Customer Dropdown */}
                {showCustomerDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch(customer.name);
                          setShowCustomerDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </div>
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Product Link
                </label>
                <div className="relative">
                  <input
                    type="url"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                    placeholder="White/Gray"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all text-sm"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:ring-primary/30 transition-all resize-none text-sm"
                  placeholder="Add any additional notes here..."
                />
              </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-orange-600/90 rounded-xl active:bg-primary/95 transition-colors"
              disabled={
                (userRole === "admin" || userRole === "worker") &&
                !selectedCustomer
              }
            >
              Add Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
