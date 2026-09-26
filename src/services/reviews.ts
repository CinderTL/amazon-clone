import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function refreshProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

export async function hasPurchasedProduct(userId: string, productId: string) {
  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: { not: OrderStatus.CANCELLED },
      },
    },
  });
  return Boolean(purchased);
}

export async function ratingDistribution(productId: string) {
  const groups = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const group of groups) {
    if (group.rating >= 1 && group.rating <= 5) {
      counts[group.rating as 1 | 2 | 3 | 4 | 5] = group._count.rating;
    }
  }
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return { counts, total };
}
