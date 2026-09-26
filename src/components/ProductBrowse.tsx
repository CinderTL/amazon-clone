"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";

type Product = Parameters<typeof ProductGrid>[0]["products"][number];

export function ProductBrowse({
  initialProducts,
  initialTotal,
  pageSize = 12,
}: {
  initialProducts: Product[];
  initialTotal: number;
  pageSize?: number;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    const next = page + 1;
    const res = await fetch(`/api/products?page=${next}&pageSize=${pageSize}&sort=newest`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setProducts((prev) => [...prev, ...(data.items || [])]);
    setTotal(data.total ?? total);
    setPage(next);
  }

  return (
    <section className="w-full px-4 md:px-8 lg:px-12 py-10 md:py-14">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold">Browse products</h2>
          <p className="text-sm text-[var(--muted)] mt-1">A mixed feed from across the marketplace</p>
        </div>
      </div>
      <ProductGrid products={products} />
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" variant="secondary" disabled={loading} onClick={loadMore}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </section>
  );
}
