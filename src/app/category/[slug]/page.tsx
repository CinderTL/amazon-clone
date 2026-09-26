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

  const accentClass =
    category.accent === "sky"
      ? "lx-module-sky"
      : category.accent === "mint"
        ? "lx-module-mint"
        : category.accent === "mustard"
          ? "lx-module-mustard"
          : "lx-module-coral";

  return (
    <div className="w-full">
      <section className={`${accentClass} py-10 w-full`}>
        <div className="w-full px-4 md:px-8 lg:px-12">
          <h1 className="font-heading text-4xl font-extrabold">{category.name}</h1>
          {category.description && <p className="mt-2 text-[var(--text-muted)] max-w-xl">{category.description}</p>}
        </div>
      </section>
      <div className="w-full px-4 md:px-8 lg:px-12 py-8 grid lg:grid-cols-[240px_1fr] gap-6">
        <ProductFilters />
        <ProductGrid products={data.items} />
      </div>
    </div>
  );
}
