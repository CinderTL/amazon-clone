"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role, OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  requireAuth,
  requireSeller,
  verifyPassword,
} from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActionState = {
  error?: string;
  success?: string;
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
  storeName: z.string().optional(),
});

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "CUSTOMER",
    storeName: formData.get("storeName") || undefined,
  });
  if (!parsed.success) return { error: "Please check your details and try again." };

  const { name, email, password, role, storeName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists." };

  if (role === "SELLER" && (!storeName || storeName.trim().length < 2)) {
    return { error: "Store name is required for seller accounts." };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as Role,
      ...(role === "SELLER" && storeName
        ? {
            sellerProfile: {
              create: {
                storeName: storeName.trim(),
                slug: slugify(storeName.trim()) + "-" + Date.now().toString(36),
                description: `${storeName.trim()} on Lixazon`,
              },
            },
          }
        : {}),
      cart: { create: {} },
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (user.role === Role.SELLER) redirect("/seller/dashboard");
  redirect("/");
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");

  if (!email || !password) return { error: "Email and password are required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (next.startsWith("/") && user.role === Role.SELLER && (next === "/" || next === "")) {
    redirect("/seller/dashboard");
  }
  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function addToCartAction(productId: string, quantity = 1): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to add items to your cart." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) return { error: "Product not found." };
  if (product.stock < 1) return { error: "This item is out of stock." };

  let cart = await prisma.cart.findUnique({ where: { userId: session.userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: session.userId } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  const newQty = (existing?.quantity || 0) + quantity;
  if (newQty > product.stock) return { error: `Only ${product.stock} in stock.` };

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/");
  return { success: "Added to cart." };
}

export async function updateCartItemAction(itemId: string, quantity: number): Promise<ActionState> {
  const session = await requireAuth("/login");
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId: session.userId } },
    include: { product: true },
  });
  if (!item) return { error: "Item not found." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    if (quantity > item.product.stock) return { error: `Only ${item.product.stock} in stock.` };
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
  revalidatePath("/cart");
  return { success: "Cart updated." };
}

export async function removeCartItemAction(itemId: string) {
  const session = await requireAuth("/login");
  await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId: session.userId } },
  });
  revalidatePath("/cart");
}

export async function checkoutAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth("/login");
  const addressId = String(formData.get("addressId") || "");
  const cardNumber = String(formData.get("cardNumber") || "").replace(/\s/g, "");

  if (!addressId) return { error: "Please select a shipping address." };
  if (cardNumber.length < 12) return { error: "Enter a valid demo card number." };

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.userId },
  });
  if (!address) return { error: "Address not found." };

  const cart = await prisma.cart.findUnique({
    where: { userId: session.userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) return { error: "Your cart is empty." };

  for (const item of cart.items) {
    if (!item.product.active) return { error: `${item.product.name} is no longer available.` };
    if (item.quantity > item.product.stock) {
      return { error: `Not enough stock for ${item.product.name}.` };
    }
  }

  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  const orderNumber = `LX-${Date.now().toString(36).toUpperCase()}`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`Not enough stock for ${item.product.name}.`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          addressId: address.id,
          status: OrderStatus.CONFIRMED,
          subtotal,
          shipping,
          tax,
          total,
          paymentMethod: `Demo Card ···· ${cardNumber.slice(-4)}`,
          shippingName: address.fullName,
          shippingLine1: address.line1,
          shippingLine2: address.line2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingPostal: address.postalCode,
          shippingCountry: address.country,
          shippingPhone: address.phone,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              sellerId: i.product.sellerId,
              name: i.product.name,
              imageUrl: i.product.imageUrl,
              price: i.product.price,
              quantity: i.quantity,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    revalidatePath("/cart");
    revalidatePath("/account/orders");
    redirect(`/checkout/confirmation/${order.id}`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    return { error: e instanceof Error ? e.message : "Checkout failed." };
  }
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth("/login");
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (name.length < 2) return { error: "Name is required." };

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, phone: phone || null },
  });
  await createSession({ ...session, name });
  revalidatePath("/account");
  return { success: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth("/login");
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  if (next.length < 6) return { error: "New password must be at least 6 characters." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: await hashPassword(next) },
  });
  return { success: "Password updated." };
}

export async function saveAddressAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAuth("/login");
  const id = String(formData.get("id") || "");
  const data = {
    label: String(formData.get("label") || "Home").trim() || "Home",
    fullName: String(formData.get("fullName") || "").trim(),
    line1: String(formData.get("line1") || "").trim(),
    line2: String(formData.get("line2") || "").trim() || null,
    city: String(formData.get("city") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    postalCode: String(formData.get("postalCode") || "").trim(),
    country: String(formData.get("country") || "United States").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    isDefault: formData.get("isDefault") === "on",
  };

  if (!data.fullName || !data.line1 || !data.city || !data.state || !data.postalCode) {
    return { error: "Please fill in all required address fields." };
  }

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.userId },
      data: { isDefault: false },
    });
  }

  if (id) {
    await prisma.address.updateMany({
      where: { id, userId: session.userId },
      data,
    });
  } else {
    const count = await prisma.address.count({ where: { userId: session.userId } });
    await prisma.address.create({
      data: {
        ...data,
        userId: session.userId,
        isDefault: data.isDefault || count === 0,
      },
    });
  }
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: "Address saved." };
}

export async function deleteAddressAction(id: string) {
  const session = await requireAuth("/login");
  await prisma.address.deleteMany({ where: { id, userId: session.userId } });
  revalidatePath("/account/addresses");
}

// ——— Seller actions ———

export async function upsertProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { seller } = await requireSeller();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = parseFloat(String(formData.get("price") || "0"));
  const compareAtRaw = String(formData.get("compareAt") || "").trim();
  const stock = parseInt(String(formData.get("stock") || "0"), 10);
  const categoryId = String(formData.get("categoryId") || "");
  const brand = String(formData.get("brand") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const active = formData.get("active") === "on";
  const featured = formData.get("featured") === "on";

  if (!name || !description || !categoryId || !imageUrl) {
    return { error: "Name, description, category, and image URL are required." };
  }
  if (!(price > 0) || stock < 0 || Number.isNaN(stock)) {
    return { error: "Enter a valid price and stock." };
  }

  const baseSlug = slugify(name);
  const data = {
    name,
    description,
    price,
    compareAt: compareAtRaw ? parseFloat(compareAtRaw) : null,
    stock,
    categoryId,
    brand,
    imageUrl,
    images: JSON.stringify([imageUrl]),
    active,
    featured,
  };

  if (id) {
    const existing = await prisma.product.findFirst({
      where: { id, sellerId: seller.id },
    });
    if (!existing) return { error: "Product not found." };
    await prisma.product.update({ where: { id }, data });
  } else {
    let slug = baseSlug;
    let n = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }
    await prisma.product.create({
      data: { ...data, slug, sellerId: seller.id },
    });
  }

  revalidatePath("/seller/products");
  revalidatePath("/seller/inventory");
  revalidatePath("/");
  redirect("/seller/products");
}

export async function deleteProductAction(id: string) {
  const { seller } = await requireSeller();
  await prisma.product.deleteMany({ where: { id, sellerId: seller.id } });
  revalidatePath("/seller/products");
}

export async function updateStockAction(productId: string, stock: number) {
  const { seller } = await requireSeller();
  if (stock < 0 || Number.isNaN(stock)) return;
  await prisma.product.updateMany({
    where: { id: productId, sellerId: seller.id },
    data: { stock },
  });
  revalidatePath("/seller/inventory");
  revalidatePath("/seller/products");
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const { seller } = await requireSeller();
  const item = await prisma.orderItem.findFirst({
    where: { orderId, sellerId: seller.id },
  });
  if (!item) return { error: "Order not found." };

  // Only update if all items in order belong to this seller OR we allow seller to update shared orders
  // For simplicity: seller can update status when they have items in the order
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
  revalidatePath("/seller/orders");
  revalidatePath("/account/orders");
  return { success: "Status updated." };
}

export async function updateStoreProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { seller } = await requireSeller();
  const storeName = String(formData.get("storeName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim() || null;
  const bannerUrl = String(formData.get("bannerUrl") || "").trim() || null;

  if (storeName.length < 2) return { error: "Store name is required." };

  await prisma.sellerProfile.update({
    where: { id: seller.id },
    data: { storeName, description, logoUrl, bannerUrl },
  });
  revalidatePath("/seller/store");
  return { success: "Store profile updated." };
}

export type ProductFilters = {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  brand?: string;
  inStock?: boolean;
};

export async function searchProducts(filters: ProductFilters) {
  const where: Prisma.ProductWhereInput = { active: true };

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { description: { contains: filters.q } },
      { brand: { contains: filters.q } },
    ];
  }
  if (filters.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }
  if (filters.brand) {
    where.brand = filters.brand;
  }
  if (filters.inStock) {
    where.stock = { gt: 0 };
  }
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (filters.sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { featured: "desc" };
  }

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      seller: true,
    },
  });
}
