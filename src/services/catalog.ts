import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type ProductListParams = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function listProducts(params: ProductListParams) {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, params.pageSize ?? 24));
  const where: Prisma.ProductWhereInput = { active: true, status: "PUBLISHED" };

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { brand: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.category) {
    where.OR = undefined;
    const cat = await prisma.category.findUnique({
      where: { slug: params.category },
      include: { children: true },
    });
    if (cat) {
      const ids = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: ids };
      if (params.q) {
        where.AND = [
          {
            OR: [
              { name: { contains: params.q, mode: "insensitive" } },
              { description: { contains: params.q, mode: "insensitive" } },
              { brand: { contains: params.q, mode: "insensitive" } },
            ],
          },
        ];
      }
    }
  }

  if (params.minPrice != null || params.maxPrice != null) {
    where.price = {};
    if (params.minPrice != null) where.price.gte = params.minPrice;
    if (params.maxPrice != null) where.price.lte = params.maxPrice;
  }
  if (params.rating != null) where.rating = { gte: params.rating };
  if (params.inStock) where.stock = { gt: 0 };
  if (params.featured) where.featured = true;

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (params.sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = params.q ? { rating: "desc" } : { featured: "desc" };
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [orderBy, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: true,
        seller: { select: { storeName: true, slug: true } },
        variants: true,
      },
    }),
  ]);

  // Light relevance: if searching, prefer name matches first in-memory for the page
  let sorted = items;
  if (params.q) {
    const q = params.q.toLowerCase();
    sorted = [...items].sort((a, b) => {
      const aScore = a.name.toLowerCase().includes(q) ? 2 : a.brand?.toLowerCase().includes(q) ? 1 : 0;
      const bScore = b.name.toLowerCase().includes(q) ? 2 : b.brand?.toLowerCase().includes(q) ? 1 : 0;
      return bScore - aScore;
    });
  }

  return { items: sorted, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: true,
      variants: true,
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { parentId: null, sellerId: null },
    include: { children: { where: { sellerId: null }, orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listMarketplaceCategories() {
  const categories = await listCategories();
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    children: category.children.map((child) => ({ id: child.id, name: child.name })),
  }));
}

export async function listCategoryOptions() {
  const categories = await prisma.category.findMany({
    where: { children: { none: {} }, sellerId: null },
    include: { parent: { select: { name: true, sortOrder: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories
    .map((category) => ({
      id: category.id,
      name: category.parent ? `${category.parent.name} / ${category.name}` : category.name,
      sort: (category.parent?.sortOrder ?? category.sortOrder) * 100 + category.sortOrder,
    }))
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name))
    .map(({ id, name }) => ({ id, name }));
}
