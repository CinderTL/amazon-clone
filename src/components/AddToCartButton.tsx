"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { addToCartAction } from "@/lib/actions";

export function AddToCartButton({
  productId,
  stock,
  variant = "cta",
}: {
  productId: string;
  stock: number;
  variant?: "cta" | "buy";
}) {
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (stock < 1) {
    return <p className="text-mh-danger font-medium">Currently unavailable</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label htmlFor={`qty-${productId}`} className="text-sm">
          Qty:
        </label>
        <select
          id={`qty-${productId}`}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="h-8 border border-mh-border rounded-md px-2 bg-mh-soft"
        >
          {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <Button
        variant={variant}
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const res = await addToCartAction(productId, qty);
            if (res.error) setMessage(res.error);
            else setMessage(res.success || "Added!");
          });
        }}
      >
        {pending ? "Adding…" : variant === "buy" ? "Buy Now" : "Add to Cart"}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("sign in") || message.includes("stock") || message.includes("found") ? "text-mh-danger" : "text-mh-stock"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
