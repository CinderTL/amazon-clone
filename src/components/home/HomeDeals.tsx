import { prisma } from "@/lib/db";
import { DealCarousel, type DealSlide } from "@/components/DealCarousel";
import { getHomeCategories } from "@/components/home/HomeCategories";

export async function HomeDeals() {
  const categories = await getHomeCategories();
  const deals: DealSlide[] = [];

  for (const category of categories) {
    const ids = [category.id, ...category.children.map((child) => child.id)];
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
        categoryName: category.name,
        categorySlug: category.slug,
      });
    }
  }

  deals.sort((a, b) => {
    const da = a.compareAt && a.compareAt > a.price ? a.compareAt - a.price : 0;
    const db = b.compareAt && b.compareAt > b.price ? b.compareAt - b.price : 0;
    return db - da;
  });

  return <DealCarousel deals={deals} />;
}
