"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to login page after successful registration
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create an Account
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Join Navand Express to start shopping
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                placeholder="+964 XXX XXX XXXX"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
