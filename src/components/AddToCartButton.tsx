"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({
  productId,
  variants = [],
  disabled,
}: {
  productId: string;
  variants?: { id: string; name: string; stock: number; priceDelta: number }[];
  disabled?: boolean;
}) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function add() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: 1,
        variantId: variantId || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      if (res.status === 401) {
        router.push(`/login?next=/product`);
        return;
      }
      setMessage(data.error || "Could not add to cart");
      return;
    }
    setMessage("Added to cart");
    router.refresh();
  }

  async function wishlist() {
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setLoading(false);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    setMessage(res.ok ? "Saved to wishlist" : "Could not save");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock < 1}
              onClick={() => setVariantId(v.id)}
              className={`rounded px-3 py-1.5 text-sm border transition ${
                variantId === v.id
                  ? "border-[var(--signal)] bg-[var(--elevated)]"
                  : "border-[var(--border)] hover:border-[var(--signal)]"
              } disabled:border-[var(--disabled)] disabled:text-[var(--disabled)]`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={add} disabled={disabled || loading} variant="primary" size="lg">
          {loading ? "Adding…" : "Add to cart"}
        </Button>
        <Button onClick={wishlist} disabled={loading} variant="secondary" size="lg">
          Wishlist
        </Button>
      </div>
      {message && <p className="text-sm text-[var(--foreground)]">{message}</p>}
    </div>
  );
}
