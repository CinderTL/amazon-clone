import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Order confirmation" };

export default async function ConfirmationPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.userId },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="w-full px-4 py-8">
      <div className="bg-white border border-mh-border rounded-lg p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-mh-stock shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-mh-stock">Order placed, thank you!</h1>
            <p className="text-mh-muted mt-1">
              Confirmation #{order.orderNumber} · {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <p className="text-sm mb-6">
          We&apos;ll send updates to <strong>{session.email}</strong>. This is a demo checkout — no
          payment was processed.
        </p>

        <div className="border border-mh-border rounded-lg divide-y divide-mh-border mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3">
              <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="absolute inset-0"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{item.name}</p>
                <p className="text-xs text-mh-muted">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="text-sm space-y-1 mb-6">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-mh-border">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="text-sm text-mh-muted mb-6">
          <p className="font-medium text-mh-text mb-1">Ship to</p>
          <p>{order.shippingName}</p>
          <p>{order.shippingLine1}</p>
          {order.shippingLine2 && <p>{order.shippingLine2}</p>}
          <p>
            {order.shippingCity}, {order.shippingState} {order.shippingPostal}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/account/orders"
            className="inline-flex h-10 px-4 items-center rounded-lg bg-gradient-to-b from-mh-cta-top to-mh-cta-bottom border border-mh-cta-border font-medium"
          >
            View orders
          </Link>
          <Link href="/" className="inline-flex h-10 px-4 items-center rounded-lg border border-mh-border bg-mh-soft font-medium">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
