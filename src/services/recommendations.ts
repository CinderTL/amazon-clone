import { prisma } from "@/lib/db";

const publicProduct = {
  active: true,
  status: "PUBLISHED" as const,
};

const productInclude = {
  category: true,
  seller: { select: { storeName: true, slug: true } },
};

type Rail = {
  id: string;
  title: string;
  products: Awaited<ReturnType<typeof loadProducts>>;
};

async function loadProducts(whereIds: string[], exclude: string[], take: number) {
  if (!whereIds.length && take < 1) return [];
  return prisma.product.findMany({
    where: {
      ...publicProduct,
      ...(whereIds.length ? { categoryId: { in: whereIds } } : {}),
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    include: productInclude,
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    take,
  });
}

async function popular(exclude: string[], take: number) {
  return prisma.product.findMany({
    where: {
      ...publicProduct,
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { rating: "desc" }, { reviewCount: "desc" }],
    take,
  });
}

export async function homepageRails(userId: string | null): Promise<Rail[]> {
  if (!userId) {
    const products = await popular([], 8);
    return products.length ? [{ id: "popular", title: "Popular right now", products }] : [];
  }

  const views = await prisma.productView.findMany({
    where: { userId, durationMs: { gte: 8000 } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  if (!views.length) {
    const products = await popular([], 8);
    return products.length ? [{ id: "popular", title: "Popular right now", products }] : [];
  }

  const categoryWeight = new Map<string, number>();
  const subcategoryWeight = new Map<string, number>();
  const viewedIds = new Set<string>();

  for (const view of views) {
    viewedIds.add(view.productId);
    const weight = Math.log1p(view.durationMs / 1000) + 1;
    categoryWeight.set(view.categoryId, (categoryWeight.get(view.categoryId) ?? 0) + weight);
    if (view.subcategoryId) {
      subcategoryWeight.set(view.subcategoryId, (subcategoryWeight.get(view.subcategoryId) ?? 0) + weight);
    }
  }

  const ranked = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const categories = ranked(categoryWeight);
  const subcategories = ranked(subcategoryWeight);
  const viewed = [...viewedIds];
  const used = new Set<string>(viewed);

  function claim<T extends { id: string }>(products: T[]) {
    const fresh = products.filter((product) => !used.has(product.id));
    fresh.forEach((product) => used.add(product.id));
    return fresh;
  }

  const names = await prisma.category.findMany({
    where: { id: { in: [...categories, ...subcategories] } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(names.map((category) => [category.id, category.name]));

  const recommended = claim(await loadProducts(categories.slice(0, 2), [...used], 8));
  const interests = claim(await loadProducts(categories.slice(0, 3), [...used], 8));
  const subcategoryId = subcategories[0];
  const more = subcategoryId ? claim(await loadProducts([subcategoryId], [...used], 8)) : [];
  let also = claim(await popular([...used], 8));
  if (also.length < 4) {
    also = [...also, ...claim(await loadProducts(categories.slice(0, 1), [...used], 8))];
  }

  const rails: Rail[] = [];
  if (recommended.length) rails.push({ id: "recommended", title: "Recommended for You", products: recommended });
  if (interests.length) rails.push({ id: "interests", title: "Based on Your Interests", products: interests });
  if (more.length && subcategoryId && nameOf.get(subcategoryId)) {
    rails.push({ id: "subcategory", title: `More from ${nameOf.get(subcategoryId)}`, products: more });
  }
  if (also.length) rails.push({ id: "also", title: "You May Also Like", products: also });

  if (!rails.length) {
    const products = await popular([], 8);
    return products.length ? [{ id: "popular", title: "Popular right now", products }] : [];
  }

  return rails;
}
