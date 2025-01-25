"use client";

import { useState } from "react";
import { Eye, EyeOff, Phone, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/providers/AppProvider";
import Image from "next/image";

const STEPS = [
  {
    id: 1,
    title: "Phone Number",
    icon: Phone,
  },
  {
    id: 2,
    title: "Password",
    icon: Lock,
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < STEPS.length) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: "+964" + formData.phoneNumber.replace(/^0+/, ""),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login");
      }

      // Show success animation
      setShowSuccess(true);

      // Use the login function from context
      login(data.access_token);

      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const inputClassName =
    "w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200";

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
            transition={{ type: "tween", duration: 0.3 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  +964
                </span>
                <input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .replace(/^0+/, "");
                    setFormData({ ...formData, phoneNumber: value });
                  }}
                  className={inputClassName + " pl-16"}
                  placeholder="750 XXX XXXX"
                />
              </div>
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
            transition={{ type: "tween", duration: 0.3 }}
            className="space-y-4"
          >
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
                  className={inputClassName}
                  placeholder="Enter your password"
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
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      id="login"
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        {showSuccess ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle2 className="w-20 h-20 text-primary mx-auto" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Login Successful!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 dark:text-gray-400"
            >
              Redirecting to dashboard...
            </motion.p>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <span className="flex justify-center ">
                <Image src="/logo.png" alt="asd" width={125} height={125} />
              </span>
            </div>

            {/* Steps */}
            <div className="flex items-center justify-center mb-8">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: currentStep >= step.id ? 1 : 0.9,
                      opacity: currentStep >= step.id ? 1 : 0.5,
                    }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      currentStep >= step.id
                        ? "bg-primary text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </motion.div>
                  {index < STEPS.length - 1 && (
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor:
                          currentStep > step.id ? "#F97316" : "#E5E7EB",
                      }}
                      className="w-12 h-1 mx-2 dark:bg-gray-700"
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {renderStep()}
              </AnimatePresence>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
                  >
                    Back
                  </motion.button>
                )}
                <motion.button
                  layout
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading
                    ? "Signing in..."
                    : currentStep === STEPS.length
                    ? "Sign in"
                    : "Next"}
                </motion.button>
              </div>
            </form>

            <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Create one
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
