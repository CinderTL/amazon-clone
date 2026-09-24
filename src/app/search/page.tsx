import { Suspense } from "react";
import { searchProducts } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q || "";
  const categorySlug = sp.category || undefined;

  const [products, categories] = await Promise.all([
    searchProducts({
      q: q || undefined,
      categorySlug,
      sort: sp.sort,
      brand: sp.brand,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      inStock: sp.inStock === "1",
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);

  const brands = [
    ...new Set(
      (
        await prisma.product.findMany({
          where: { active: true, brand: { not: null } },
          select: { brand: true },
        })
      )
        .map((p) => p.brand!)
        .filter(Boolean)
    ),
  ].sort();

  return (
    <div className="w-full px-3 md:px-4 py-4">
      <h1 className="text-2xl font-bold mb-1">
        {q ? (
          <>
            Results for <span className="text-mh-link">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          "All products"
        )}
      </h1>
      <p className="text-sm text-mh-muted mb-4">{products.length} results</p>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Suspense fallback={<div className="w-56 shrink-0" />}>
          <ProductFilters brands={brands} showCategory categories={categories} />
        </Suspense>
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
