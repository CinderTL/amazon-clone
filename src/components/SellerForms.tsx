"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";
import { Price } from "@/components/CurrencyProvider";
import { ProductImage } from "@/components/ProductImage";
import { ConfirmDialog } from "@/components/ui/Dialog";

export function ProductTable({
  products,
}: {
  products: {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    active: boolean;
    status: "DRAFT" | "PUBLISHED";
  }[];
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    if (!pendingDelete) return;
    setDeleting(true);
    await fetch(`/api/seller/products/${pendingDelete}`, { method: "DELETE" });
    setDeleting(false);
    setPendingDelete(null);
    router.refresh();
  }

  return (
    <div className="lx-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
        <h2 className="font-heading font-bold">Products</h2>
        <Link href="/seller/products/new">
          <Button size="sm">Add product</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)] bg-[var(--canvas)]">
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <ProductImage src={p.imageUrl} alt="" className="absolute inset-0" sizes="40px" />
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <Price amount={p.price} />
                </td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.status === "DRAFT" ? "Draft" : "Published"}</td>
                <td className="p-3 text-right space-x-2">
                  <Link href={`/seller/products/${p.id}/edit`} className="text-[var(--signal)]">
                    {p.status === "DRAFT" ? "Continue" : "Edit"}
                  </Link>
                  <button type="button" className="lx-focus text-[var(--signal)]" onClick={() => setPendingDelete(p.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title="Delete this product?"
        description="This removes the product from your store. You can’t undo this action."
        confirmLabel="Delete"
        destructive
        loading={deleting}
      />
    </div>
  );
}

export function InventoryEditor({
  products,
}: {
  products: { id: string; name: string; imageUrl: string; stock: number }[];
}) {
  const router = useRouter();
  return (
    <div className="lx-card divide-y divide-[var(--border)]">
      {products.map((p) => (
        <div key={p.id} className="p-4 flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <ProductImage src={p.imageUrl} alt="" className="absolute inset-0" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{p.name}</p>
          </div>
          <Input
            type="number"
            className="w-24"
            defaultValue={p.stock}
            onBlur={async (e) => {
              await fetch(`/api/seller/products/${p.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stock: Number(e.target.value) }),
              });
              router.refresh();
            }}
          />
        </div>
      ))}
      {products.length === 0 && <p className="p-6 text-center text-[var(--muted)]">No products</p>}
    </div>
  );
}

export function SellerOrdersList({
  orders,
}: {
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string | Date;
    user: { name: string; email: string };
    items: { name: string; quantity: number; price: number }[];
  }[];
}) {
  const router = useRouter();
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="lx-card p-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-bold">{o.orderNumber}</p>
              <p className="text-xs text-[var(--muted)]">
                {o.user.name} · {new Date(o.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Select
              className="w-40"
              defaultValue={o.status}
              onChange={async (e) => {
                await fetch("/api/seller/orders", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: o.id, status: e.target.value }),
                });
                router.refresh();
              }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <ul className="text-sm text-[var(--muted)] mt-3 space-y-1">
            {o.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity} — <Price amount={item.price * item.quantity} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {orders.length === 0 && <div className="lx-card p-8 text-center text-[var(--muted)]">No orders yet.</div>}
    </div>
  );
}

