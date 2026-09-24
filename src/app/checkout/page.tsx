import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/checkout");

  const [cart, addresses] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: session.userId },
      include: { items: { include: { product: true } } },
    }),
    prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  if (!cart || cart.items.length === 0) redirect("/cart");

  const subtotal = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;

  return (
    <div className="w-full px-3 md:px-4 py-4">
      <h1 className="text-2xl font-bold mb-4 text-center md:text-left">
        <span className="text-mh-navy">Checkout</span>
      </h1>
      <CheckoutForm
        addresses={addresses}
        subtotal={subtotal}
        shipping={shipping}
        tax={tax}
        total={total}
      />
    </div>
  );
}
