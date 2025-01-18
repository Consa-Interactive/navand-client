"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/AppProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Use the login function from context
      login(data.access_token);

      // Redirect to dashboard
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-500 dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                placeholder="Enter your phone number (+964...)"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:bg-orange-500 dark:hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
