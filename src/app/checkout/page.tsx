import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateCart, cartTotals } from "@/services/cart";
import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await requireAuth();
  const [addresses, cart] = await Promise.all([
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
    getOrCreateCart(session.userId),
  ]);
  const totals = cartTotals(cart.items);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Checkout</h1>
      {cart.items.length === 0 ? (
        <div className="lx-card p-8">Your cart is empty.</div>
      ) : (
        <CheckoutForm addresses={addresses} totals={totals} />
      )}
    </div>
  );
}
