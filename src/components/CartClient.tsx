"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyProvider";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ProductImage";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    stock: number;
  };
  variant: { id: string; name: string; priceDelta: number; stock: number } | null;
};

type Totals = { subtotal: number; shipping: number; tax: number; total: number; itemCount: number };

export function CartClient({ initialItems, initialTotals }: { initialItems: CartItem[]; initialTotals: Totals }) {
  const router = useRouter();
  const { format } = useCurrency();
  const [items, setItems] = useState(initialItems);
  const [totals, setTotals] = useState(initialTotals);
  const [busy, setBusy] = useState<string | null>(null);

  async function sync(method: string, body: object) {
    const res = await fetch("/api/cart", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Cart update failed");
    setItems(data.cart.items);
    setTotals(data.totals);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="lx-card p-10 text-center">
        <p className="font-heading text-xl font-bold">Your cart is empty</p>
        <Link href="/search" className="inline-block mt-4">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-3">
        {items.map((item) => {
          const unit = item.product.price + (item.variant?.priceDelta ?? 0);
          return (
            <div key={item.id} className="lx-card p-4 flex gap-4">
              <div className="h-24 w-24 rounded-2xl overflow-hidden bg-[var(--elevated)] shrink-0 relative">
                <ProductImage src={item.product.imageUrl} alt={item.product.name} className="absolute inset-0 p-2" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-[var(--signal)]">
                  {item.product.name}
                </Link>
                {item.variant && <p className="text-xs text-[var(--muted)]">{item.variant.name}</p>}
                <p className="font-bold mt-1">{format(unit)}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === item.id}
                    onClick={async () => {
                      setBusy(item.id);
                      await sync("PATCH", { itemId: item.id, quantity: item.quantity - 1 });
                      setBusy(null);
                    }}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy === item.id}
                    onClick={async () => {
                      setBusy(item.id);
                      await sync("PATCH", { itemId: item.id, quantity: item.quantity + 1 });
                      setBusy(null);
                    }}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy === item.id}
                    onClick={async () => {
                      setBusy(item.id);
                      await sync("DELETE", { itemId: item.id });
                      setBusy(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="font-semibold">{format(unit * item.quantity)}</div>
            </div>
          );
        })}
      </div>
      <aside className="lx-card p-5 h-fit sticky top-28">
        <h2 className="font-heading text-lg font-bold">Order summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal ({totals.itemCount})</dt>
            <dd>{format(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{totals.shipping === 0 ? "Free" : format(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax est.</dt>
            <dd>{format(totals.tax)}</dd>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
            <dt>Total</dt>
            <dd>{format(totals.total)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="block mt-5">
          <Button className="w-full" size="lg" variant="primary">
            Checkout
          </Button>
        </Link>
      </aside>
    </div>
  );
}
