import { prisma } from "@/lib/db";

export async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

export function cartTotals(items: { quantity: number; product: { price: number }; variant: { priceDelta: number } | null }[]) {
  const subtotal = items.reduce((sum, item) => {
    const unit = item.product.price + (item.variant?.priceDelta ?? 0);
    return sum + unit * item.quantity;
  }, 0);
  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total, itemCount: items.reduce((n, i) => n + i.quantity, 0) };
}

export async function addCartItem(userId: string, productId: string, quantity: number, variantId?: string | null) {
  const product = await prisma.product.findFirst({
    where: { id: productId, active: true, status: "PUBLISHED" },
    include: { variants: true },
  });
  if (!product) throw new Error("NOT_FOUND");

  let variant = null;
  if (variantId) {
    variant = product.variants.find((v) => v.id === variantId) || null;
    if (!variant) throw new Error("Invalid variant");
  }

  const available = variant ? variant.stock : product.stock;
  if (available < 1) throw new Error("Out of stock");

  const cart = await getOrCreateCart(userId);
  const existing = cart.items.find(
    (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
  );

  const nextQty = (existing?.quantity || 0) + quantity;
  if (nextQty > available) throw new Error(`Only ${available} in stock`);

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });
  }

  return getOrCreateCart(userId);
}

export async function updateCartItem(userId: string, itemId: string, quantity: number) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw new Error("NOT_FOUND");

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    const available = item.variant ? item.variant.stock : item.product.stock;
    if (quantity > available) throw new Error(`Only ${available} in stock`);
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  return getOrCreateCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw new Error("NOT_FOUND");
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getOrCreateCart(userId);
}
