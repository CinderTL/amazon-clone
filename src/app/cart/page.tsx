import { requireAuth } from "@/lib/auth";
import { getOrCreateCart, cartTotals } from "@/services/cart";
import { CartClient } from "@/components/CartClient";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await requireAuth();
  const cart = await getOrCreateCart(session.userId);
  const totals = cartTotals(cart.items);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Your cart</h1>
      <CartClient initialItems={cart.items} initialTotals={totals} />
    </div>
  );
}
