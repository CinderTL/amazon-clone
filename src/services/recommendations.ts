import { prisma } from "@/lib/db";
import {
  emptyInterest,
  orderForYou,
  selectFlashSale,
  type EngagementSignals,
  type InterestWeights,
  type RankProduct,
} from "@/services/home-rank";

const publicProduct = {
  active: true,
  status: "PUBLISHED" as const,
};

const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  compareAt: true,
  stock: true,
  imageUrl: true,
  rating: true,
  reviewCount: true,
  featured: true,
  categoryId: true,
  category: { select: { id: true, name: true, slug: true, parentId: true } },
  seller: { select: { storeName: true, slug: true } },
} as const;

export type HomeProduct = RankProduct & {
  name: string;
  slug: string;
  stock: number;
  imageUrl: string;
  category: { id: string; name: string; slug: string; parentId: string | null } | null;
  seller: { storeName: string; slug: string } | null;
};

type RankedHome = {
  at: number;
  flashSale: HomeProduct[];
  feed: HomeProduct[];
};

const CACHE_MS = 30_000;
const cache = new Map<string, RankedHome>();
const inflight = new Map<string, Promise<RankedHome>>();

async function loadInterest(userId: string | null): Promise<InterestWeights> {
  if (!userId) return emptyInterest();
  const views = await prisma.productView.findMany({
    where: { userId, durationMs: { gte: 8000 } },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: { categoryId: true, subcategoryId: true, durationMs: true },
  });
  const interest = emptyInterest();
  for (const view of views) {
    const weight = Math.log1p(view.durationMs / 1000) + 1;
    interest.category.set(view.categoryId, (interest.category.get(view.categoryId) ?? 0) + weight);
    if (view.subcategoryId) {
      interest.subcategory.set(view.subcategoryId, (interest.subcategory.get(view.subcategoryId) ?? 0) + weight);
    }
  }
  return interest;
}

async function loadSignals(): Promise<EngagementSignals> {
  const [viewGroups, orderGroups] = await Promise.all([
    prisma.productView.groupBy({
      by: ["productId"],
      _count: { productId: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { status: { not: "CANCELLED" } } },
      _sum: { quantity: true },
    }),
  ]);
  return {
    views: new Map(viewGroups.map((row) => [row.productId, row._count.productId])),
    orders: new Map(orderGroups.map((row) => [row.productId, row._sum.quantity ?? 0])),
  };
}

function toRanked(product: {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  categoryId: string | null;
  category: { id: string; name: string; slug: string; parentId: string | null } | null;
  seller: { storeName: string; slug: string } | null;
}): HomeProduct {
  return {
    ...product,
    rootCategoryId: product.category?.parentId ?? product.category?.id ?? null,
  };
}

async function computeRanked(userId: string | null): Promise<RankedHome> {
  const [rows, signals, interest] = await Promise.all([
    prisma.product.findMany({
      where: publicProduct,
      select: productSelect,
    }),
    loadSignals(),
    loadInterest(userId),
  ]);
  const products = rows.map(toRanked);
  const flashSale = selectFlashSale(products, signals, interest, 12);
  const feed = orderForYou(
    products,
    signals,
    interest,
    new Set(flashSale.map((product) => product.id))
  );
  return { at: Date.now(), flashSale, feed };
}

async function getRanked(userId: string | null) {
  const key = userId ?? "guest";
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit;
  const pending = inflight.get(key);
  if (pending) return pending;
  const job = computeRanked(userId)
    .then((ranked) => {
      cache.set(key, ranked);
      inflight.delete(key);
      return ranked;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });
  inflight.set(key, job);
  return job;
}

export async function homepageMerch(userId: string | null, pageSize = 12) {
  const ranked = await getRanked(userId);
  const size = Math.min(24, Math.max(1, pageSize));
  return {
    flashSale: ranked.flashSale,
    forYou: {
      items: ranked.feed.slice(0, size),
      total: ranked.feed.length,
      page: 1,
      pageSize: size,
    },
  };
}

export async function forYouPage(userId: string | null, page = 1, pageSize = 12) {
  const ranked = await getRanked(userId);
  const size = Math.min(24, Math.max(1, pageSize));
  const current = Math.max(1, Math.floor(page));
  const start = (current - 1) * size;
  return {
    items: ranked.feed.slice(start, start + size),
    total: ranked.feed.length,
    page: current,
    pageSize: size,
  };
}
