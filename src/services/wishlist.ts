import { prisma } from "@/lib/db";

export async function getOrCreateWishlist(userId: string) {
  return prisma.wishlist.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: { product: { include: { category: true, seller: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function addWishlistItem(userId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, active: true } });
  if (!product) throw new Error("NOT_FOUND");
  const wishlist = await getOrCreateWishlist(userId);
  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
    update: {},
    create: { wishlistId: wishlist.id, productId },
  });
  return getOrCreateWishlist(userId);
}

export async function removeWishlistItem(userId: string, productId: string) {
  const wishlist = await getOrCreateWishlist(userId);
  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });
  return getOrCreateWishlist(userId);
}
