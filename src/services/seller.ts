import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { OrderStatus } from "@/generated/prisma/client";

export async function getSellerForUser(userId: string) {
  const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
  if (!seller) throw new Error("FORBIDDEN");
  return seller;
}

export async function listSellerProducts(sellerId: string) {
  return prisma.product.findMany({
    where: { sellerId },
    include: { category: true, variants: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createSellerProduct(
  sellerId: string,
  data: {
    name: string;
    description: string;
    price: number;
    compareAt?: number | null;
    stock: number;
    imageUrl: string;
    images?: string[];
    brand?: string;
    categoryId: string;
    featured?: boolean;
  }
) {
  let slug = slugify(data.name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  return prisma.product.create({
    data: {
      ...data,
      slug,
      images: data.images?.length ? data.images : [data.imageUrl],
      sellerId,
    },
  });
}

export async function updateSellerProduct(
  sellerId: string,
  productId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    compareAt: number | null;
    stock: number;
    imageUrl: string;
    images: string[];
    brand: string | null;
    categoryId: string;
    featured: boolean;
    active: boolean;
  }>
) {
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id: productId }, data });
}

export async function deleteSellerProduct(sellerId: string, productId: string) {
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId } });
  if (!product) throw new Error("NOT_FOUND");
  await prisma.product.delete({ where: { id: productId } });
  return { ok: true };
}

export async function listSellerOrders(sellerId: string) {
  return prisma.order.findMany({
    where: { items: { some: { sellerId } } },
    include: {
      items: { where: { sellerId } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateSellerOrderStatus(sellerId: string, orderId: string, status: OrderStatus) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, items: { some: { sellerId } } },
  });
  if (!order) throw new Error("NOT_FOUND");
  return prisma.order.update({ where: { id: orderId }, data: { status } });
}

export async function sellerDashboard(sellerId: string) {
  const [products, orders, revenue] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.order.count({ where: { items: { some: { sellerId } }, paymentStatus: "SUCCEEDED" } }),
    prisma.orderItem.aggregate({
      where: { sellerId, order: { paymentStatus: "SUCCEEDED" } },
      _sum: { price: true },
    }),
  ]);

  const recent = await listSellerOrders(sellerId);
  const salesByDay = recent
    .filter((o) => o.paymentStatus === "SUCCEEDED")
    .slice(0, 14)
    .map((o) => ({
      date: o.createdAt.toISOString().slice(0, 10),
      total: o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    }));

  return {
    productCount: products,
    orderCount: orders,
    revenue: revenue._sum.price ?? 0,
    salesByDay,
    recentOrders: recent.slice(0, 8),
  };
}
