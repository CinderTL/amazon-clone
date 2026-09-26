import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Price } from "@/components/CurrencyProvider";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await requireAuth();
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">Orders</h1>
      <div className="space-y-4">
        {orders.length === 0 && <div className="lx-card p-8 text-[var(--muted)]">No orders yet.</div>}
        {orders.map((order) => (
          <div key={order.id} className="lx-card p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-heading font-bold">{order.orderNumber}</p>
                <p className="text-sm text-[var(--muted)]">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  <Price amount={order.total} />
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {order.status} · {order.paymentStatus}
                </p>
              </div>
            </div>
            <ul className="mt-3 text-sm space-y-1">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>
            {order.paymentStatus === "SUCCEEDED" && (
              <Link href={`/checkout/confirmation/${order.id}`} className="text-sm text-[var(--signal)] mt-3 inline-block">
                View confirmation
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
