import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Price } from "@/components/CurrencyProvider";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="lx-card p-8 text-center bg-[var(--elevated)]">
        <p className="text-sm font-semibold text-[var(--foreground)]">Order confirmed</p>
        <h1 className="font-heading text-3xl font-extrabold mt-2">{order.orderNumber}</h1>
        <p className="text-[var(--muted)] mt-2">
          Placed {formatDate(order.createdAt)} · <Price amount={order.total} />
        </p>
      </div>
      <div className="lx-card p-6 mt-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm gap-4">
            <span>
              {item.name} × {item.quantity}
              {item.variantLabel ? ` (${item.variantLabel})` : ""}
            </span>
            <span className="font-medium">
              <Price amount={item.price * item.quantity} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/account/orders">
          <Button variant="secondary">View orders</Button>
        </Link>
        <Link href="/">
          <Button>Keep shopping</Button>
        </Link>
      </div>
    </div>
  );
}
