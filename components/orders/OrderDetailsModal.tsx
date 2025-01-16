"use client";

import {
  DialogTitle,
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { X, Package, MapPin } from "lucide-react";

export interface OrderDetails {
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
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails;
}

// Add formatDate function
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

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
}: OrderDetailsModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                  <div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Order #{order.id}
                    </DialogTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed on {formatDate(new Date(order.orderDate))}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Status Banner */}
                  <div
                    className={`rounded-lg bg-${
                      order.status === "Cancelled" ? "red" : "blue"
                    }-50 p-4 dark:bg-${
                      order.status === "Cancelled" ? "red" : "blue"
                    }-900/20`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-medium text-${
                            order.status === "Cancelled" ? "red" : "blue"
                          }-700 dark:text-${
                            order.status === "Cancelled" ? "red" : "blue"
                          }-500`}
                        >
                          Order Status
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          {order.status}
                        </p>
                      </div>
                      <Package
                        className={`h-8 w-8 text-${
                          order.status === "Cancelled" ? "red" : "blue"
                        }-500`}
                      />
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-orange-600">
                        <span className="absolute inset-0 flex items-center justify-center text-base font-medium text-white">
                          {order.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {order.customerName}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {order.country}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Product Details
                    </h3>
                    <div className="mt-4 flex items-start gap-4">
                      <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {order.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {order.size && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              Size: {order.size}
                            </span>
                          )}
                          {order.color && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {order.color}
                            </span>
                          )}
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Qty: {order.quantity}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Unit Price
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${order.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(order.price * order.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Free
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium text-gray-900 dark:text-white">
                            Total
                          </span>
                          <span className="text-xl font-semibold text-gray-900 dark:text-white">
                            ${(order.price * order.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
