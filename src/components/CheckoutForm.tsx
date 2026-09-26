"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Form";

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
};

type Totals = { subtotal: number; shipping: number; tax: number; total: number };

export function CheckoutForm({
  addresses,
  totals,
}: {
  addresses: Address[];
  totals: Totals;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [addressId, setAddressId] = useState(addresses[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderMeta, setOrderMeta] = useState<{ orderId: string; stub?: boolean; stubIntentId?: string } | null>(null);

  const selected = useMemo(() => addresses.find((a) => a.id === addressId), [addresses, addressId]);

  async function createIntent() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not start checkout");
      return;
    }
    setOrderMeta({ orderId: data.orderId, stub: data.stub, stubIntentId: data.stubIntentId });
    setStep(2);
  }

  async function confirmPay() {
    if (!orderMeta) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/checkout/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: orderMeta.orderId,
        paymentIntentId: orderMeta.stubIntentId,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Payment failed");
      return;
    }
    router.push(`/checkout/confirmation/${data.order.id}`);
    router.refresh();
  }

  if (addresses.length === 0) {
    return (
      <div className="lx-card p-6">
        <p className="font-medium">Add a shipping address before checkout.</p>
        <a href="/account/addresses" className="text-[var(--sky)] text-sm mt-2 inline-block">
          Manage addresses
        </a>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="lx-card p-6 space-y-6">
        <ol className="flex gap-2 text-xs font-semibold">
          {["Shipping", "Payment", "Review"].map((label, i) => (
            <li
              key={label}
              className={`lx-pill px-3 py-1 ${step === i + 1 ? "bg-[var(--sky)] text-white" : "bg-[var(--bg-page)] text-[var(--text-muted)]"}`}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {error && <p className="text-sm text-[var(--coral)]">{error}</p>}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Ship to</Label>
              <Select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.fullName}, {a.line1}, {a.city}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={createIntent} disabled={loading || !addressId} variant="coral">
              {loading ? "Preparing…" : "Continue to payment"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              Stripe test mode{orderMeta?.stub ? " (local stub — no live Stripe keys configured)" : ""}. Use test card{" "}
              <code className="text-[var(--text)]">4242 4242 4242 4242</code> when keys are live.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Card number</Label>
                <Input defaultValue="4242 4242 4242 4242" readOnly={Boolean(orderMeta?.stub)} />
              </div>
              <div>
                <Label>Expiry</Label>
                <Input defaultValue="12/34" readOnly={Boolean(orderMeta?.stub)} />
              </div>
              <div>
                <Label>CVC</Label>
                <Input defaultValue="123" readOnly={Boolean(orderMeta?.stub)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="sky" onClick={() => setStep(3)}>
                Review order
              </Button>
            </div>
          </div>
        )}

        {step === 3 && selected && (
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p className="font-semibold">Shipping</p>
              <p>
                {selected.fullName}
                <br />
                {selected.line1}
                <br />
                {selected.city}, {selected.state} {selected.postalCode}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="coral" disabled={loading} onClick={confirmPay}>
                {loading ? "Placing order…" : `Pay ${formatPrice(totals.total)}`}
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="lx-card p-5 h-fit">
        <h2 className="font-heading font-bold text-lg">Summary</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatPrice(totals.tax)}</dd>
          </div>
          <div className="flex justify-between font-bold border-t border-[var(--border)] pt-2">
            <dt>Total</dt>
            <dd>{formatPrice(totals.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
