import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { SellerOrdersList } from "@/components/SellerForms";

export const metadata = { title: "Seller Orders" };

export default async function SellerOrdersPage() {
  const { seller } = await requireSeller();

  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  const byOrder = new Map<
    string,
    {
      id: string;
      orderNumber: string;
      status: (typeof items)[0]["order"]["status"];
      createdAt: Date;
      shippingName: string;
      items: { id: string; name: string; quantity: number; price: number }[];
      sellerTotal: number;
    }
  >();

  for (const item of items) {
    const existing = byOrder.get(item.orderId);
    if (existing) {
      existing.items.push({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      });
      existing.sellerTotal += item.price * item.quantity;
    } else {
      byOrder.set(item.orderId, {
        id: item.order.id,
        orderNumber: item.order.orderNumber,
        status: item.order.status,
        createdAt: item.order.createdAt,
        shippingName: item.order.shippingName,
        items: [
          {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          },
        ],
        sellerTotal: item.price * item.quantity,
      });
    }
  }

  const orders = Array.from(byOrder.values());

  return (
    <SellerShell current="/seller/orders" title="Orders">
      <SellerOrdersList orders={orders} />
    </SellerShell>
  );
}
