export type RankProduct = {
  id: string;
  price: number;
  compareAt: number | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
  categoryId: string | null;
  rootCategoryId: string | null;
};

export type InterestWeights = {
  category: Map<string, number>;
  subcategory: Map<string, number>;
};

export type EngagementSignals = {
  views: Map<string, number>;
  orders: Map<string, number>;
};

export function emptyInterest(): InterestWeights {
  return { category: new Map(), subcategory: new Map() };
}

export function isValidDiscount(product: Pick<RankProduct, "price" | "compareAt">) {
  return product.compareAt != null && product.compareAt > product.price && product.price >= 0;
}

function engagement(product: RankProduct, signals: EngagementSignals) {
  return {
    views: signals.views.get(product.id) ?? 0,
    orders: signals.orders.get(product.id) ?? 0,
  };
}

export function qualifiesForFlashSale(product: RankProduct, signals: EngagementSignals) {
  if (!isValidDiscount(product)) return false;
  const { views, orders } = engagement(product, signals);
  const goodReviews = product.rating >= 4 && product.reviewCount >= 1;
  const popular = product.reviewCount >= 2 || views >= 3 || orders >= 1 || product.featured;
  return goodReviews && popular;
}

export function flashSaleScore(product: RankProduct, signals: EngagementSignals, interest: InterestWeights) {
  const compareAt = product.compareAt ?? product.price;
  const discount = compareAt > 0 ? (compareAt - product.price) / compareAt : 0;
  const reviewQuality = (product.rating / 5) * Math.log1p(product.reviewCount);
  const { views, orders } = engagement(product, signals);
  const popularity = Math.log1p(views) + Math.log1p(orders) * 1.5 + (product.featured ? 1.2 : 0);
  const categoryInterest = product.rootCategoryId ? (interest.category.get(product.rootCategoryId) ?? 0) : 0;
  const subcategoryInterest = product.categoryId ? (interest.subcategory.get(product.categoryId) ?? 0) : 0;
  const relevance = Math.log1p(categoryInterest + subcategoryInterest * 1.25);
  return discount * 45 + reviewQuality * 18 + popularity * 6 + relevance * 12;
}

function forYouScore(product: RankProduct, signals: EngagementSignals, interest: InterestWeights) {
  const { views, orders } = engagement(product, signals);
  const popularity =
    (product.rating / 5) * Math.log1p(product.reviewCount) * 4 +
    Math.log1p(views) +
    Math.log1p(orders) * 1.6 +
    (product.featured ? 1.5 : 0);
  const categoryInterest = product.rootCategoryId ? (interest.category.get(product.rootCategoryId) ?? 0) : 0;
  const subcategoryInterest = product.categoryId ? (interest.subcategory.get(product.categoryId) ?? 0) : 0;
  return popularity + Math.log1p(categoryInterest) * 2 + Math.log1p(subcategoryInterest) * 3;
}

function categoryWeight(rootId: string, interest: InterestWeights) {
  const raw = rootId === "other" ? 0 : (interest.category.get(rootId) ?? 0);
  return 1 + Math.min(4, Math.log1p(raw));
}

export function selectFlashSale<T extends RankProduct>(
  products: T[],
  signals: EngagementSignals,
  interest: InterestWeights,
  limit = 12
) {
  return products
    .filter((product) => qualifiesForFlashSale(product, signals))
    .sort((a, b) => {
      const score = flashSaleScore(b, signals, interest) - flashSaleScore(a, signals, interest);
      return score || a.id.localeCompare(b.id);
    })
    .slice(0, limit);
}

export function orderForYou<T extends RankProduct>(
  products: T[],
  signals: EngagementSignals,
  interest: InterestWeights,
  exclude: Set<string>
) {
  const groups = new Map<string, T[]>();
  for (const product of products) {
    if (exclude.has(product.id)) continue;
    const key = product.rootCategoryId ?? "other";
    const list = groups.get(key);
    if (list) list.push(product);
    else groups.set(key, [product]);
  }

  for (const list of groups.values()) {
    list.sort(
      (a, b) => forYouScore(b, signals, interest) - forYouScore(a, signals, interest) || a.id.localeCompare(b.id)
    );
  }

  const cursors = new Map<string, number>();
  const taken = new Map<string, number>();
  const ordered: T[] = [];
  const total = [...groups.values()].reduce((sum, list) => sum + list.length, 0);

  while (ordered.length < total) {
    let bestKey = "";
    let bestRank = -Infinity;
    for (const [key, list] of groups) {
      const index = cursors.get(key) ?? 0;
      if (index >= list.length) continue;
      const rank = categoryWeight(key, interest) / (1 + (taken.get(key) ?? 0));
      if (rank > bestRank || (rank === bestRank && (bestKey === "" || key.localeCompare(bestKey) < 0))) {
        bestRank = rank;
        bestKey = key;
      }
    }
    if (!bestKey) break;
    const list = groups.get(bestKey);
    if (!list) break;
    const index = cursors.get(bestKey) ?? 0;
    ordered.push(list[index]);
    cursors.set(bestKey, index + 1);
    taken.set(bestKey, (taken.get(bestKey) ?? 0) + 1);
  }

  return ordered;
}
