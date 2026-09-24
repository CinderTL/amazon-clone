"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { removeCartItemAction, updateCartItemAction } from "@/lib/actions";
import { ProductImage } from "@/components/ProductImage";

type CartItemView = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    stock: number;
    seller?: { storeName: string } | null;
  };
};

export function CartItems({ items }: { items: CartItemView[] }) {
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <div className="bg-white border border-mh-border rounded-lg p-8 text-center">
        <h2 className="text-xl font-bold mb-2">Your Lixazon Cart is empty</h2>
        <p className="text-mh-muted mb-4">Browse categories and add items to get started.</p>
        <Link href="/" className="text-mh-link hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-mh-border rounded-lg divide-y divide-mh-border">
      <div className="px-4 py-3">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 p-4">
          <Link href={`/product/${item.product.slug}`} className="relative w-28 h-28 shrink-0 rounded overflow-hidden block">
            <ProductImage
              src={item.product.imageUrl}
              alt={item.product.name}
              className="absolute inset-0 rounded"
              sizes="112px"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.product.slug}`} className="font-medium hover:text-mh-link-hover line-clamp-2">
              {item.product.name}
            </Link>
            {item.product.seller && (
              <p className="text-xs text-mh-muted mt-0.5">Sold by {item.product.seller.storeName}</p>
            )}
            <p className="text-mh-stock text-sm mt-1">
              {item.product.stock > 0 ? "In Stock" : "Out of Stock"}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <select
                value={item.quantity}
                disabled={pending}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  startTransition(async () => {
                    await updateCartItemAction(item.id, q);
                  });
                }}
                className="h-8 border border-mh-border rounded-md px-2 bg-mh-soft text-sm"
              >
                {Array.from({ length: Math.min(item.product.stock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Qty: {n}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="text-sm text-mh-link hover:underline"
                disabled={pending}
                onClick={() => startTransition(() => removeCartItemAction(item.id))}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="font-bold text-right">{formatPrice(item.product.price)}</div>
        </div>
      ))}
    </div>
  );
}

export function CartSummary({ subtotal, count }: { subtotal: number; count: number }) {
  return (
    <div className="bg-white border border-mh-border rounded-lg p-4 sticky top-24">
      <p className="text-lg">
        Subtotal ({count} {count === 1 ? "item" : "items"}):{" "}
        <span className="font-bold">{formatPrice(subtotal)}</span>
      </p>
      <p className="text-xs text-mh-muted mt-1 mb-4">
        {subtotal >= 35 ? "Qualifies for FREE Shipping" : `Add ${formatPrice(35 - subtotal)} for FREE Shipping`}
      </p>
      <Link href="/checkout">
        <Button variant="cta" size="lg" className="w-full">
          Proceed to checkout
        </Button>
      </Link>
    </div>
  );
}
