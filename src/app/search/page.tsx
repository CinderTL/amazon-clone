import { listProducts } from "@/services/catalog";
import { ProductGrid } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const data = await listProducts({
    q: params.q,
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    rating: params.rating ? Number(params.rating) : undefined,
    inStock: params.inStock === "true",
    featured: params.featured === "true",
    sort: params.sort || "rating",
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8">
      <h1 className="font-heading text-3xl font-extrabold">
        {params.q ? `Results for “${params.q}”` : "Search"}
      </h1>
      <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">{data.total} products</p>
      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <ProductFilters />
        <ProductGrid products={data.items} />
      </div>
    </div>
  );
}
