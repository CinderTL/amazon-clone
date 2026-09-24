import { Suspense } from "react";
import { searchProducts } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category?.name || "Category" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return (
      <div className="w-full px-4 py-10">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </div>
    );
  }

  const products = await searchProducts({
    categorySlug: slug,
    sort: sp.sort,
    brand: sp.brand,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    inStock: sp.inStock === "1",
  });

  const brands = [
    ...new Set(
      (
        await prisma.product.findMany({
          where: { categoryId: category.id, brand: { not: null } },
          select: { brand: true },
        })
      )
        .map((p) => p.brand!)
        .filter(Boolean)
    ),
  ].sort();

  return (
    <div className="w-full px-3 md:px-4 py-4">
      <nav className="text-xs text-mh-muted mb-3">
        <a href="/" className="text-mh-link hover:underline">
          Home
        </a>
        {" › "}
        <span>{category.name}</span>
      </nav>
      <h1 className="text-2xl font-bold mb-1">{category.name}</h1>
      {category.description && <p className="text-mh-muted mb-4">{category.description}</p>}
      <p className="text-sm text-mh-muted mb-4">{products.length} results</p>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <Suspense fallback={<div className="w-56 shrink-0" />}>
          <ProductFilters brands={brands} />
        </Suspense>
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
