import { Suspense } from "react";
import { CategoryCirclesSkeleton } from "@/components/home/CategoryCircles";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeDeals } from "@/components/home/HomeDeals";
import { HomeMerch } from "@/components/home/HomeMerch";
import { HomeMerchSkeleton } from "@/components/home/HomeMerchSkeleton";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <Suspense fallback={<CategoryCirclesSkeleton />}>
        <HomeCategories />
      </Suspense>
      <Suspense fallback={null}>
        <HomeDeals />
      </Suspense>
      <Suspense fallback={<HomeMerchSkeleton />}>
        <HomeMerch />
      </Suspense>
    </div>
  );
}
