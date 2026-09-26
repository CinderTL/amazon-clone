import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { listProducts } from "@/services/catalog";
import { ProductGrid } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });
  if (!category) notFound();

  const data = await listProducts({
    category: slug,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    rating: sp.rating ? Number(sp.rating) : undefined,
    inStock: sp.inStock === "true",
    sort: sp.sort || "newest",
  });

  return (
    <div className="w-full px-4 py-8 md:px-8 lg:px-12">
      <h1 className="font-heading text-4xl font-extrabold">{category.name}</h1>
      <div className="mt-6 grid w-full gap-6 lg:grid-cols-[240px_1fr]">
        <ProductFilters />
        <ProductGrid products={data.items} />
      </div>
    </div>
  );
}
