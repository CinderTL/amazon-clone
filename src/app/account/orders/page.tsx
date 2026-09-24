import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";

export const metadata = { title: "Your Orders" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full px-4 py-6">
      <nav className="text-xs text-mh-muted mb-3">
        <Link href="/account" className="text-mh-link hover:underline">
          Your Account
        </Link>
        {" › "}
        <span>Your Orders</span>
      </nav>
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-mh-border rounded-lg p-8 text-center text-mh-muted">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/" className="text-mh-link hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-mh-border rounded-lg overflow-hidden">
              <div className="bg-mh-soft px-4 py-3 flex flex-wrap gap-4 text-xs justify-between border-b border-mh-border">
                <div>
                  <div className="text-mh-muted">ORDER PLACED</div>
                  <div>{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-mh-muted">TOTAL</div>
                  <div>{formatPrice(order.total)}</div>
                </div>
                <div>
                  <div className="text-mh-muted">SHIP TO</div>
                  <div>{order.shippingName}</div>
                </div>
                <div className="text-right">
                  <div className="text-mh-muted">ORDER # {order.orderNumber}</div>
                  <div className="font-medium text-mh-stock">{order.status}</div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                      <ProductImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="absolute inset-0"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-mh-muted">
                        Qty {item.quantity} · {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
