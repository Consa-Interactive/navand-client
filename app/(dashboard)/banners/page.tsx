import { Suspense } from "react";
import BannerList from "@/components/banners/BannerList";
import BannerListSkeleton from "@/components/banners/BannerListSkeleton";

export default function BannersPage() {
  return (
    <div className="space-y-6 p-6">
      <Suspense fallback={<BannerListSkeleton />}>
        <BannerList />
      </Suspense>
    </div>
  );
}
