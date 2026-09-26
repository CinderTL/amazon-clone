import { prisma } from "@/lib/db";
import { DealCarousel, type DealSlide } from "@/components/DealCarousel";
import { PopularCategoryStrips } from "@/components/PopularCategoryStrips";
import { ProductBrowse } from "@/components/ProductBrowse";
import { NAV_CATEGORIES } from "@/lib/nav-categories";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categorySlugs = NAV_CATEGORIES.map((c) => c.slug);

  const categories = await prisma.category.findMany({
    where: { slug: { in: categorySlugs } },
    select: { id: true, name: true, slug: true },
  });

  const deals: DealSlide[] = [];
  for (const cat of categories) {
    const best = await prisma.product.findFirst({
      where: {
        active: true,
        categoryId: cat.id,
        compareAt: { not: null },
      },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    });
    const fallback =
      best ||
      (await prisma.product.findFirst({
        where: { active: true, categoryId: cat.id },
        orderBy: { rating: "desc" },
      }));
    if (fallback) {
      deals.push({
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        price: fallback.price,
        compareAt: fallback.compareAt,
        imageUrl: fallback.imageUrl,
        categoryName: cat.name,
        categorySlug: cat.slug,
      });
    }
  }

  // Prefer deals with real discount first in carousel order
  deals.sort((a, b) => {
    const da = a.compareAt && a.compareAt > a.price ? a.compareAt - a.price : 0;
    const db = b.compareAt && b.compareAt > b.price ? b.compareAt - b.price : 0;
    return db - da;
  });

  const pageSize = 12;
  const [initialProducts, total] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      take: pageSize,
      include: { category: true, seller: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div className="w-full">
      <PopularCategoryStrips />
      <DealCarousel deals={deals} />
      <ProductBrowse initialProducts={initialProducts} initialTotal={total} pageSize={pageSize} />
    </div>
  );
}
