import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { DealCarousel, type DealSlide } from "@/components/DealCarousel";
import { PopularCategoryStrips } from "@/components/PopularCategoryStrips";
import { ProductBrowse } from "@/components/ProductBrowse";
import { RecommendationRails } from "@/components/RecommendationRails";
import { homepageRails } from "@/services/recommendations";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { select: { id: true } } },
  });

  const deals: DealSlide[] = [];
  for (const cat of categories) {
    const ids = [cat.id, ...cat.children.map((child) => child.id)];
    const best = await prisma.product.findFirst({
      where: {
        active: true,
        status: "PUBLISHED",
        categoryId: { in: ids },
        compareAt: { not: null },
      },
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
    });
    const deal =
      best ??
      (await prisma.product.findFirst({
        where: { active: true, status: "PUBLISHED", categoryId: { in: ids } },
        orderBy: { rating: "desc" },
      }));
    if (deal) {
      deals.push({
        id: deal.id,
        name: deal.name,
        slug: deal.slug,
        description: deal.description,
        price: deal.price,
        compareAt: deal.compareAt,
        imageUrl: deal.imageUrl,
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
      where: { active: true, status: "PUBLISHED" },
      take: pageSize,
      include: { category: true, seller: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where: { active: true, status: "PUBLISHED" } }),
  ]);

  const session = await getSession();
  const rails = await homepageRails(session?.userId ?? null);

  return (
    <div className="w-full">
      <PopularCategoryStrips
        categories={categories.slice(0, 6).map((category) => ({
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl,
          accent: category.accent,
        }))}
      />
      <DealCarousel deals={deals} />
      <RecommendationRails rails={rails} />
      <ProductBrowse initialProducts={initialProducts} initialTotal={total} pageSize={pageSize} />
    </div>
  );
}
