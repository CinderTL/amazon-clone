"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { saveAddressAction, deleteAddressAction, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, FormError, FormSuccess } from "@/components/ui/Form";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="cta" disabled={pending}>
      {pending ? "Saving…" : "Save address"}
    </Button>
  );
}

type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [state, action] = useActionState(saveAddressAction, {} as ActionState);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        {addresses.length === 0 && (
          <p className="text-mh-muted text-sm">No addresses yet. Add one on the right.</p>
        )}
        {addresses.map((a) => (
          <div key={a.id} className="bg-white border border-mh-border rounded-lg p-4 text-sm">
            {a.isDefault && (
              <span className="text-xs font-bold text-mh-stock uppercase">Default</span>
            )}
            <p className="font-bold">{a.label}</p>
            <p>{a.fullName}</p>
            <p>{a.line1}</p>
            {a.line2 && <p>{a.line2}</p>}
            <p>
              {a.city}, {a.state} {a.postalCode}
            </p>
            <p>{a.country}</p>
            {a.phone && <p>{a.phone}</p>}
            <button
              type="button"
              disabled={pending}
              className="mt-2 text-mh-danger text-xs hover:underline"
              onClick={() => startTransition(() => deleteAddressAction(a.id))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form action={action} className="bg-white border border-mh-border rounded-lg p-4 space-y-3 h-fit">
        <h2 className="font-bold">Add a new address</h2>
        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" defaultValue="Home" />
        </div>
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div>
          <Label htmlFor="line1">Address line 1</Label>
          <Input id="line1" name="line1" required />
        </div>
        <div>
          <Label htmlFor="line2">Address line 2</Label>
          <Input id="line2" name="line2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="postalCode">ZIP</Label>
            <Input id="postalCode" name="postalCode" required />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" defaultValue="United States" />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" />
          Make default
        </label>
        <FormError message={state.error} />
        <FormSuccess message={state.success} />
        <Submit />
      </form>
    </div>
  );
}
