"use client";

import { useEffect, useRef, useState } from "react";
import { ProductGrid, type CardProduct } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";

export function ForYouFeed({
  initialItems,
  initialTotal,
  pageSize,
}: {
  initialItems: CardProduct[];
  initialTotal: number;
  pageSize: number;
}) {
  const [products, setProducts] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const hasMore = products.length < total;

  async function loadMore() {
    if (lockRef.current || products.length >= total) return;
    lockRef.current = true;
    setLoading(true);
    setError(false);
    const next = page + 1;
    try {
      const res = await fetch(`/api/home/feed?page=${next}&pageSize=${pageSize}`);
      const data = await res.json();
      if (!res.ok) {
        setError(true);
        return;
      }
      const items = (data.items ?? []) as CardProduct[];
      setProducts((prev) => {
        const seen = new Set(prev.map((product) => product.id));
        return [...prev, ...items.filter((product) => !seen.has(product.id))];
      });
      setTotal(typeof data.total === "number" ? data.total : total);
      setPage(next);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      lockRef.current = false;
    }
  }

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "480px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, error, page, products.length]);

  return (
    <section className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12" aria-labelledby="for-you-heading">
      <h2 id="for-you-heading" className="mb-4 font-heading text-2xl font-extrabold md:text-3xl">
        For You
      </h2>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No products available yet.</p>
      ) : (
        <ProductGrid products={products} variant="home" />
      )}
      {loading && (
        <div className="mt-6" aria-live="polite">
          <p className="sr-only">Loading more products</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="shimmer aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => void loadMore()}>
            Couldn&apos;t load more products. Try again
          </Button>
        </div>
      )}
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
      {!hasMore && products.length > 0 && (
        <p className="mt-8 text-center text-sm text-[var(--muted)]">You&apos;ve seen all products</p>
      )}
    </section>
  );
}
