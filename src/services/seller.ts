import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { assertProductImages } from "@/lib/uploads";
import { OrderStatus, ProductStatus, ShippingScope } from "@/generated/prisma/client";

export type SellerProductInput = {
  name: string;
  description?: string;
  price?: number;
  compareAt?: number | null;
  stock?: number;
  images?: string[];
  brand?: string | null;
  categoryId?: string | null;
  featured?: boolean;
  shippingScope?: ShippingScope;
  intent: "draft" | "publish";
};

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

async function uniqueSlug(name: string, currentId?: string) {
  let slug = slugify(name) || "product";
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists && exists.id !== currentId) slug = `${slug}-${Date.now().toString(36)}`;
  return slug;
}

async function productWriteData(sellerId: string, input: SellerProductInput) {
  const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!seller) throw new Error("FORBIDDEN");

  const images = input.images ?? [];
  const shippingScope = input.shippingScope ?? ShippingScope.INTERNATIONAL;
  const publishing = input.intent === "publish";

  if (publishing) {
    if (input.name.trim().length < 2) throw new ApiError("Add a product name before publishing");
    if ((input.description ?? "").trim().length < 10) throw new ApiError("Add a description of at least 10 characters before publishing");
    if (!input.price || input.price <= 0) throw new ApiError("Add a price greater than 0 before publishing");
    if (input.stock == null || input.stock < 0) throw new ApiError("Add a stock quantity before publishing");
    if (!input.categoryId) throw new ApiError("Choose a subcategory before publishing");
    if (!images.length) throw new ApiError("Add at least one product image before publishing");
    if (input.compareAt != null && input.compareAt <= input.price) {
      throw new ApiError("Compare-at price must be higher than the selling price");
    }
    if (shippingScope === ShippingScope.NATIONAL && !seller.originCountry) {
      throw new ApiError("Enable your shipping location before publishing a national product");
    }
  }

  if (images.length) await assertProductImages(images);
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, sellerId: null, parentId: { not: null } },
    });
    if (!category) throw new ApiError("Choose a website subcategory");
  }

  return {
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    price: input.price ?? 0,
    compareAt: input.compareAt ?? null,
    stock: input.stock ?? 0,
    images,
    imageUrl: images[0] ?? "",
    brand: input.brand?.trim() || null,
    categoryId: input.categoryId || null,
    featured: Boolean(input.featured),
    shippingScope,
    originCountry: shippingScope === ShippingScope.NATIONAL ? seller.originCountry : null,
    status: publishing ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
    active: publishing,
  };
}

export async function createSellerProduct(sellerId: string, input: SellerProductInput) {
  const data = await productWriteData(sellerId, input);
  const slug = await uniqueSlug(data.name);
  return prisma.product.create({
    data: { ...data, slug, sellerId },
  });
}

export async function updateSellerProduct(sellerId: string, productId: string, input: SellerProductInput) {
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId } });
  if (!product) throw new Error("NOT_FOUND");
  const data = await productWriteData(sellerId, input);
  const slug = product.name === data.name ? product.slug : await uniqueSlug(data.name, product.id);
  return prisma.product.update({ where: { id: productId }, data: { ...data, slug } });
}

export async function updateSellerStock(sellerId: string, productId: string, stock: number) {
  const product = await prisma.product.findFirst({ where: { id: productId, sellerId } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id: productId }, data: { stock } });
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
