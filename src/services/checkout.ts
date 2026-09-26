import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { cartTotals, getOrCreateCart } from "./cart";
import { getStripe, stripeStubEnabled } from "@/lib/stripe";

export async function createCheckoutIntent(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("Address not found");

  const cart = await getOrCreateCart(userId);
  if (!cart.items.length) throw new Error("Cart is empty");

  for (const item of cart.items) {
    const available = item.variant ? item.variant.stock : item.product.stock;
    if (item.quantity > available) {
      throw new Error(`${item.product.name} only has ${available} in stock`);
    }
  }

  const totals = cartTotals(cart.items);
  const orderNumber = `LX-${Date.now().toString().slice(-8)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      addressId: address.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.REQUIRES_PAYMENT,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      total: totals.total,
      paymentMethod: "Stripe",
      shippingName: address.fullName,
      shippingLine1: address.line1,
      shippingLine2: address.line2,
      shippingCity: address.city,
      shippingState: address.state,
      shippingPostal: address.postalCode,
      shippingCountry: address.country,
      shippingPhone: address.phone,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          sellerId: item.product.sellerId,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          variantLabel: item.variant?.name,
          price: item.product.price + (item.variant?.priceDelta ?? 0),
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });

  const stripe = getStripe();
  if (stripe && !stripeStubEnabled()) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "usd",
      metadata: { orderId: order.id, orderNumber: order.orderNumber, userId },
      automatic_payment_methods: { enabled: true },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: intent.id, paymentStatus: PaymentStatus.PROCESSING },
    });
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: intent.client_secret,
      stub: false,
      totals,
    };
  }

  // Test stub: client confirms without Stripe keys
  const stubIntentId = `pi_stub_${order.id}`;
  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: stubIntentId, paymentStatus: PaymentStatus.PROCESSING },
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    clientSecret: null,
    stub: true,
    stubIntentId,
    totals,
  };
}

export async function confirmCheckout(userId: string, orderId: string, paymentIntentId?: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) throw new Error("NOT_FOUND");
  if (order.paymentStatus === PaymentStatus.SUCCEEDED) {
    return order;
  }

  const stripe = getStripe();
  if (stripe && !stripeStubEnabled() && paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") {
      throw new Error(`Payment not completed (${intent.status})`);
    }
  } else if (!stripeStubEnabled()) {
    throw new Error("Stripe payment required");
  }

  return prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!fresh) throw new Error("NOT_FOUND");
    if (fresh.paymentStatus === PaymentStatus.SUCCEEDED) return fresh;

    for (const item of fresh.items) {
      if (item.variantId) {
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant || variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.SUCCEEDED,
        status: OrderStatus.CONFIRMED,
        paymentMethod: stripeStubEnabled() ? "Stripe (test stub)" : "Stripe",
        stripePaymentIntentId: paymentIntentId || fresh.stripePaymentIntentId,
      },
      include: { items: true },
    });

    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return updated;
  });
}

export async function markOrderPaidByIntent(paymentIntentId: string) {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });
  if (!order) return null;
  if (order.paymentStatus === PaymentStatus.SUCCEEDED) return order;
  return confirmCheckout(order.userId, order.id, paymentIntentId);
}
