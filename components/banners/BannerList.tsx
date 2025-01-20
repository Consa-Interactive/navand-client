"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  Plus,
  X,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useApp } from "@/providers/AppProvider";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link?: string | null;
  isActive: boolean;
  order: number;
}

export default function BannerList() {
  const { user } = useApp();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    isActive: true,
    order: 0,
  });

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/banners", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch banners");
      }

      const data = await response.json();
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load banners"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateBanner = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          order: banners.length,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create banner");
      }

      await fetchBanners();
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        link: "",
        isActive: true,
        order: 0,
      });
      toast.success("Banner created successfully");
    } catch (error) {
      console.error("Error creating banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create banner"
      );
    }
  };

  const handleUpdateBanner = async (id: number, data: Partial<Banner>) => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update banner");
      }

      await fetchBanners();
      setSelectedBanner(null);
      toast.success("Banner updated successfully");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update banner"
      );
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/banners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete banner");
      }

      await fetchBanners();
      toast.success("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete banner"
      );
    }
  };

  const handleMoveOrder = async (id: number, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((banner) => banner.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === banners.length - 1)
    )
      return;

    const newOrder =
      direction === "up"
        ? banners[currentIndex - 1].order
        : banners[currentIndex + 1].order;

    await handleUpdateBanner(id, { order: newOrder });
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          You don&apos;t have access to this page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your homepage banners
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-gray-500 dark:text-gray-400">No banners found</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="relative aspect-[16/9]">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveOrder(banner.id, "up")}
                      disabled={banner.order === 0}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(banner.id, "down")}
                      disabled={banner.order === banners.length - 1}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {banner.description}
                </p>
                {banner.link && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">{banner.link}</span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBanner(banner)}
                      className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="rounded-lg p-1 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      handleUpdateBanner(banner.id, {
                        isActive: !banner.isActive,
                      })
                    }
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      banner.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedBanner(null);
        }}
        open={isCreateModalOpen || !!selectedBanner}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedBanner ? "Edit Banner" : "Create Banner"}
              </Dialog.Title>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedBanner(null);
                }}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedBanner?.title || formData.title}
                  onChange={(e) =>
                    selectedBanner
                      ? setSelectedBanner({
                          ...selectedBanner,
                          title: e.target.value,
                        })
                      : setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Description
                </label>
                <input
                  type="text"
                  value={selectedBanner?.description || formData.description}
                  onChange={(e) =>
                    selectedBanner
                      ? setSelectedBanner({
                          ...selectedBanner,
                          description: e.target.value,
                        })
                      : setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Image URL
                </label>
                <input
                  type="url"
                  value={selectedBanner?.imageUrl || formData.imageUrl}
                  onChange={(e) =>
                    selectedBanner
                      ? setSelectedBanner({
                          ...selectedBanner,
                          imageUrl: e.target.value,
                        })
                      : setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Link (Optional)
                </label>
                <input
                  type="url"
                  value={selectedBanner?.link || formData.link}
                  onChange={(e) =>
                    selectedBanner
                      ? setSelectedBanner({
                          ...selectedBanner,
                          link: e.target.value,
                        })
                      : setFormData({ ...formData, link: e.target.value })
                  }
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter banner link"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={selectedBanner?.isActive || formData.isActive}
                  onChange={(e) =>
                    selectedBanner
                      ? setSelectedBanner({
                          ...selectedBanner,
                          isActive: e.target.checked,
                        })
                      : setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedBanner(null);
                }}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedBanner
                    ? handleUpdateBanner(selectedBanner.id, selectedBanner)
                    : handleCreateBanner()
                }
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-orange-600/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selectedBanner ? "Save Changes" : "Create Banner"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
