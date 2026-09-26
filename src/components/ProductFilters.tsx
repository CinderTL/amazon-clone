"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, Label } from "@/components/ui/Form";

function FiltersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <aside className="lx-card p-4 space-y-4 w-full lg:sticky lg:top-28 self-start">
      <h2 className="font-heading font-bold text-base">Filters</h2>

      <div>
        <Label>Sort by</Label>
        <Select value={searchParams.get("sort") || "rating"} onChange={(e) => update("sort", e.target.value)}>
          <option value="rating">Top rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </Select>
      </div>

      <div>
        <Label>Min price</Label>
        <Select value={searchParams.get("minPrice") || ""} onChange={(e) => update("minPrice", e.target.value)}>
          <option value="">Any</option>
          <option value="25">$25</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="200">$200</option>
        </Select>
      </div>

      <div>
        <Label>Max price</Label>
        <Select value={searchParams.get("maxPrice") || ""} onChange={(e) => update("maxPrice", e.target.value)}>
          <option value="">Any</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="200">$200</option>
          <option value="500">$500</option>
        </Select>
      </div>

      <div>
        <Label>Min rating</Label>
        <Select value={searchParams.get("rating") || ""} onChange={(e) => update("rating", e.target.value)}>
          <option value="">Any</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={searchParams.get("inStock") === "true"}
          onChange={(e) => update("inStock", e.target.checked ? "true" : "")}
        />
        <label htmlFor="inStock" className="text-sm">
          In stock only
        </label>
      </div>

      <button
        type="button"
        className="text-sm text-[var(--sky)]"
        onClick={() => {
          const q = searchParams.get("q");
          router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
        }}
      >
        Clear filters
      </button>
    </aside>
  );
}

export function ProductFilters() {
  return (
    <Suspense fallback={<aside className="lx-card p-4">Loading filters…</aside>}>
      <FiltersInner />
    </Suspense>
  );
}
