"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Link,
  Package,
  User,
  CheckCircle2,
  Upload,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import Image from "next/image";
import { useApp } from "@/providers/AppProvider";

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => Promise<void>;
}

const STEPS = [
  { id: 1, title: "Product Details", icon: Package },
  { id: 2, title: "Customer Info", icon: User },
];

export default function AddOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: AddOrderModalProps) {
  const { user } = useApp();
  const isAdminOrWorker = user?.role === "ADMIN" || user?.role === "WORKER";
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ id: number; name: string; phoneNumber: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    productLink: "",
    size: "",
    color: "",
    quantity: 1,
    notes: "",
    customer: "",
  });

  // Handle click outside search dropdown
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

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore]);

  // Fetch customers when search term changes or page increases
  const fetchCustomers = useCallback(
    async (isNewSearch: boolean = false) => {
      if (!isAdminOrWorker) {
        setCustomers([]);
        setHasMore(false);
        return;
      }

      try {
        setIsLoadingMore(true);
        const currentPage = isNewSearch ? 1 : page;
        const token = Cookies.get("token");
        const response = await fetch(
          `/api/users?role=CUSTOMER${
            searchTerm ? `&search=${searchTerm}` : ""
          }&page=${currentPage}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const { users, hasMore: moreResults } = await response.json();
          setCustomers((prev) => (isNewSearch ? users : [...prev, ...users]));
          setHasMore(moreResults);
          setIsDropdownOpen(true);
        } else {
          console.error("Failed to fetch customers");
          setCustomers([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [searchTerm, page, isAdminOrWorker]
  );

  // Handle search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCustomers(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchCustomers]);

  // Handle page changes
  useEffect(() => {
    if (page > 1) {
      fetchCustomers();
    }
  }, [page, fetchCustomers]);

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

  const handleNext = () => {
    // Validate product link in step 1
    if (currentStep === 1) {
      if (!formData.productLink.trim()) {
        setError("Product link is required");
        return;
      }
      setError(null);
    }

    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setError(null);
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      handleNext();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          imageUrl: uploadedImage,
          userId: isAdminOrWorker ? formData.customer : user?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create order");
      }

      setShowSuccess(true);
      setTimeout(async () => {
        setShowSuccess(false);
        await onOrderCreated();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
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
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-full w-full object-cover"
                    width={400}
                    height={300}
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="dropzone-file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Drop your image here, or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, GIF (Max 5MB)
                    </p>
                  </label>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="productLink"
                  value={formData.productLink}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border ${
                    error
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-600"
                  } focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200`}
                  placeholder="https://example.com/product"
                  required
                />
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {isAdminOrWorker ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Search Customer
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      setIsDropdownOpen(true);
                      if (customers.length === 0) {
                        setPage(1);
                        fetchCustomers(true);
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                    placeholder="Search by name or phone number..."
                  />
                  {renderCustomerDropdown()}
                </div>
                {formData.customer && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Selected customer ID: {formData.customer}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
                    <span className="absolute inset-0 flex items-center justify-center text-base font-medium text-white">
                      {user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      {user?.phoneNumber}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                style={{ resize: "none" }}
                rows={4}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const renderCustomerDropdown = () => {
    if (!isDropdownOpen) return null;

    return (
      <div
        ref={dropdownRef}
        className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="max-h-60 overflow-auto py-1">
          {customers.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No customers found
            </div>
          ) : (
            <>
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      customer: customer.id.toString(),
                    }));
                    setSearchTerm(`${customer.name} (${customer.phoneNumber})`);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {customer.phoneNumber}
                  </div>
                </button>
              ))}
              {hasMore && (
                <div
                  ref={loadingRef}
                  className="flex items-center justify-center p-2 text-sm text-gray-500 dark:text-gray-400"
                >
                  {isLoadingMore ? "Loading more..." : "Scroll for more"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>

          {showSuccess ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-xl font-semibold text-gray-900 dark:text-white"
              >
                Order Created Successfully
              </motion.h2>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Add New Order
              </h2>

              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      currentStep >= step.id
                        ? "text-primary"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors duration-200 ${
                        currentStep >= step.id
                          ? "bg-primary/10"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Form Steps */}
              <AnimatePresence mode="wait" custom={direction}>
                {renderStep()}
              </AnimatePresence>

              {error && (
                <p className="mt-4 text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 text-sm font-medium rounded-xl border-2 border-primary text-white bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentStep === 1 ? "ml-auto" : ""
                  }`}
                >
                  {loading
                    ? "Creating..."
                    : currentStep === STEPS.length
                    ? "Create Order"
                    : "Next"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
