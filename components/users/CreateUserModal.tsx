"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Cookies from "js-cookie";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => Promise<void>;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    password: "",
    confirmPassword: "",
    address: "",
    country: "",
    city: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email || undefined,
          phoneNumber: formData.phone,
          role: formData.role as "ADMIN" | "WORKER" | "CUSTOMER",
          password: formData.password,
          address: formData.address || undefined,
          country: formData.country || undefined,
          city: formData.city || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create user");
      }

      await onUserCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500";

  const labelClassName =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700">
          {/* Header */}
          <div className="relative border-b border-gray-200 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-8">
              Create New User
            </h3>
            <button
              onClick={onClose}
              className="absolute right-3 top-2.5 sm:right-4 sm:top-4 rounded-xl p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* Personal Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 text-sm sm:text-base">
                  Personal Information
                </h4>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName}>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Account Settings
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Role</label>

                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className={inputClassName}
                      required
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="ADMIN">Admin</option>
                      <option value="WORKER">Worker</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Security
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClassName}>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={inputClassName}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Address Information
                </h4>
                <div className="grid gap-4">
                  <div>
                    <label className={labelClassName}>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className={inputClassName}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClassName}>Country</label>
                      <select
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className={inputClassName}
                      >
                        <option value="">Select a city</option>
                        <option value="ER">Erbil</option>
                        <option value="SU">Sulaymaniyah</option>
                        <option value="DU">Duhok</option>
                        <option value="AK">Akre</option>
                        <option value="ZA">Zakho</option>
                        <option value="BA">Baghdad</option>
                        <option value="MO">Mousul</option>
                        <option value="KA">Kirkuk</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className={inputClassName}
                        placeholder="Enter city"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 border-t border-gray-200 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-500 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
