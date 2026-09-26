import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Price } from "@/components/CurrencyProvider";
import Link from "next/link";
import { SellerShell } from "@/components/SellerNav";
import { SellerCharts } from "@/components/SellerCharts";

export const metadata = { title: "Seller Dashboard" };

export default async function SellerDashboardPage() {
  const { seller } = await requireSeller();

  const [products, orderItems, lowStock, drafts] = await Promise.all([
    prisma.product.count({ where: { sellerId: seller.id, status: "PUBLISHED" } }),
    prisma.orderItem.findMany({
      where: { sellerId: seller.id },
      include: { order: true, product: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { sellerId: seller.id, status: "PUBLISHED", stock: { lte: 20 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.product.findMany({
      where: { sellerId: seller.id, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  const revenue = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const unitsSold = orderItems.reduce((s, i) => s + i.quantity, 0);
  const orderIds = new Set(orderItems.map((i) => i.orderId));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const dayRevenue = orderItems
      .filter((i) => {
        const t = new Date(i.order.createdAt);
        return t >= day && t < next;
      })
      .reduce((s, i) => s + i.price * i.quantity, 0);
    return {
      day: day.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: Math.round(dayRevenue * 100) / 100,
    };
  });

  const statusCounts = orderItems.reduce(
    (acc, i) => {
      acc[i.order.status] = (acc[i.order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const recent = orderItems.slice(0, 8);

  return (
    <SellerShell current="/seller/dashboard" title={`${seller.storeName} Dashboard`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Revenue", value: <Price amount={revenue} /> },
          { label: "Orders", value: String(orderIds.size) },
          { label: "Units sold", value: String(unitsSold) },
          { label: "Products", value: String(products) },
        ].map((s) => (
          <div key={s.label} className="lx-card p-4">
            <p className="text-xs text-[var(--muted)] uppercase">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="lx-card mb-4 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-bold">Drafts</h2>
          <Link href="/seller/products/new" className="text-sm font-semibold text-[var(--signal)]">
            New product
          </Link>
        </div>
        {drafts.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No drafts. Save a product as a draft to finish it later.</p>
        ) : (
          <ul className="space-y-2">
            {drafts.map((draft) => (
              <li key={draft.id} className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 text-sm last:border-0">
                <span className="line-clamp-1">{draft.name}</span>
                <Link href={`/seller/products/${draft.id}/edit`} className="shrink-0 font-semibold text-[var(--signal)]">
                  Continue
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="lx-card p-4">
          <h2 className="font-bold mb-3">Revenue (7 days)</h2>
          <SellerCharts data={chartData} statusCounts={statusCounts} />
        </div>
        <div className="lx-card p-4">
          <h2 className="font-bold mb-3">Low stock alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">All products well stocked.</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between text-sm border-b border-[var(--border)] pb-2">
                  <span className="line-clamp-1 pr-2">{p.name}</span>
                  <span className={p.stock <= 5 ? "text-[var(--signal)] font-bold" : "text-[var(--muted)]"}>
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="lx-card p-4">
        <h2 className="font-bold mb-3">Recent order items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                <th className="py-2 pr-2">Order</th>
                <th className="py-2 pr-2">Product</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2 pr-2">Total</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((i) => (
                <tr key={i.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-2">{i.order.orderNumber}</td>
                  <td className="py-2 pr-2 max-w-[180px] truncate">{i.name}</td>
                  <td className="py-2 pr-2">{i.quantity}</td>
                  <td className="py-2 pr-2">
                    <Price amount={i.price * i.quantity} />
                  </td>
                  <td className="py-2 pr-2">{i.order.status}</td>
                  <td className="py-2">{formatDate(i.order.createdAt)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[var(--muted)]">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SellerShell>
  );
}
