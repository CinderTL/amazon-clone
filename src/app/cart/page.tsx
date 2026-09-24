import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CartItems, CartSummary } from "@/components/CartClient";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/cart");

  const cart = await prisma.cart.findUnique({
    where: { userId: session.userId },
    include: {
      items: {
        include: { product: { include: { seller: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="w-full px-3 md:px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-9">
          <CartItems items={items} />
        </div>
        {items.length > 0 && (
          <div className="lg:col-span-3">
            <CartSummary subtotal={subtotal} count={count} />
          </div>
        )}
      </div>
    </div>
  );
}
