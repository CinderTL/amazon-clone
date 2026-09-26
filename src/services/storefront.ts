import { prisma } from "@/lib/db";

export async function getStorefront(slug: string, categorySlug?: string) {
  const store = await prisma.sellerProfile.findUnique({ where: { slug } });
  if (!store) return null;

  const categories = await prisma.category.findMany({
    where: { sellerId: store.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const activeCategory = categorySlug ? categories.find((category) => category.slug === categorySlug) ?? null : null;
  if (categorySlug && !activeCategory) return { store, categories, products: [], activeCategory: null, missingCategory: true };

  const products = await prisma.product.findMany({
    where: {
      sellerId: store.id,
      active: true,
      status: "PUBLISHED",
      ...(activeCategory ? { categoryId: activeCategory.id } : {}),
    },
    include: {
      category: true,
      seller: { select: { storeName: true, slug: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return { store, categories, products, activeCategory, missingCategory: false };
}
