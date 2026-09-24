"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, Label } from "@/components/ui/Form";

export function ProductFilters({
  brands = [],
  showCategory = false,
  categories = [],
}: {
  brands?: string[];
  showCategory?: boolean;
  categories?: { name: string; slug: string }[];
}) {
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
    <aside className="bg-white border border-mh-border rounded-lg p-4 space-y-4 w-full md:w-56 lg:w-60 shrink-0 md:sticky md:top-24 self-start">
      <h2 className="font-bold text-base">Filters</h2>

      <div>
        <Label>Sort by</Label>
        <Select
          value={searchParams.get("sort") || "featured"}
          onChange={(e) => update("sort", e.target.value === "featured" ? "" : e.target.value)}
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Avg. Customer Review</option>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
        </Select>
      </div>

      {showCategory && categories.length > 0 && (
        <div>
          <Label>Category</Label>
          <Select
            value={searchParams.get("category") || ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <Label>Brand</Label>
          <Select value={searchParams.get("brand") || ""} onChange={(e) => update("brand", e.target.value)}>
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div>
        <Label>Min price</Label>
        <Select
          value={searchParams.get("minPrice") || ""}
          onChange={(e) => update("minPrice", e.target.value)}
        >
          <option value="">Any</option>
          <option value="0">$0</option>
          <option value="25">$25</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="200">$200</option>
          <option value="500">$500</option>
        </Select>
      </div>

      <div>
        <Label>Max price</Label>
        <Select
          value={searchParams.get("maxPrice") || ""}
          onChange={(e) => update("maxPrice", e.target.value)}
        >
          <option value="">Any</option>
          <option value="50">$50</option>
          <option value="100">$100</option>
          <option value="200">$200</option>
          <option value="500">$500</option>
          <option value="1000">$1000</option>
          <option value="2000">$2000</option>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={searchParams.get("inStock") === "1"}
          onChange={(e) => update("inStock", e.target.checked ? "1" : "")}
          className="rounded border-mh-border"
        />
        <label htmlFor="inStock" className="text-sm">
          In stock only
        </label>
      </div>

      <button
        type="button"
        className="text-sm text-mh-link hover:text-mh-link-hover hover:underline"
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
