"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { checkoutAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError, Select } from "@/components/ui/Form";
import { formatPrice } from "@/lib/utils";

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="buy" size="lg" className="w-full" disabled={pending}>
      {pending ? "Placing order…" : "Place your order"}
    </Button>
  );
}

export function CheckoutForm({
  addresses,
  subtotal,
  shipping,
  tax,
  total,
}: {
  addresses: Address[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}) {
  const [state, action] = useActionState(checkoutAction, {} as ActionState);
  const defaultId = addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "";

  if (addresses.length === 0) {
    return (
      <div className="bg-white border border-mh-border rounded-lg p-6 text-center">
        <p className="mb-3">Add a shipping address before checkout.</p>
        <Link href="/account/addresses" className="text-mh-link hover:underline">
          Manage addresses
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8 space-y-4">
        <section className="bg-white border border-mh-border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-3">1. Shipping address</h2>
          <Select name="addressId" defaultValue={defaultId} required>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}: {a.fullName}, {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}
              </option>
            ))}
          </Select>
          <Link href="/account/addresses" className="inline-block mt-2 text-sm text-mh-link hover:underline">
            Add or edit addresses
          </Link>
        </section>

        <section className="bg-white border border-mh-border rounded-lg p-4">
          <h2 className="font-bold text-lg mb-3">2. Payment method (demo)</h2>
          <p className="text-sm text-mh-muted mb-3">
            No real charges — use any card number with 12+ digits (e.g. 4242424242424242).
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="cardName">Name on card</Label>
              <Input id="cardName" name="cardName" defaultValue="Demo Shopper" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cardNumber">Card number</Label>
              <Input id="cardNumber" name="cardNumber" defaultValue="4242424242424242" required />
            </div>
            <div>
              <Label htmlFor="expiry">Expiry</Label>
              <Input id="expiry" name="expiry" defaultValue="12/28" required />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" name="cvc" defaultValue="123" required />
            </div>
          </div>
        </section>
        <FormError message={state.error} />
      </div>

      <div className="lg:col-span-4">
        <div className="bg-white border border-mh-border rounded-lg p-4 sticky top-24 space-y-2">
          <Submit />
          <p className="text-xs text-mh-muted text-center">
            By placing your order, you agree to Lixazon&apos;s demo terms.
          </p>
          <hr className="border-mh-border my-3" />
          <h3 className="font-bold">Order summary</h3>
          <div className="flex justify-between text-sm">
            <span>Items</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-mh-danger pt-2 border-t border-mh-border">
            <span>Order total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
