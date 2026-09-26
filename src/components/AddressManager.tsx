"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";

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

export function AddressManager({ initial }: { initial: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [error, setError] = useState("");

  async function refresh() {
    const res = await fetch("/api/addresses");
    const data = await res.json();
    if (res.ok) setAddresses(data.addresses);
    router.refresh();
  }

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: form.get("label"),
        fullName: form.get("fullName"),
        line1: form.get("line1"),
        line2: form.get("line2") || null,
        city: form.get("city"),
        state: form.get("state"),
        postalCode: form.get("postalCode"),
        country: form.get("country") || "United States",
        phone: form.get("phone") || null,
        isDefault: form.get("isDefault") === "on",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    await refresh();
  }

  async function remove(id: string) {
    await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="lx-card p-4">
            <div className="flex justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {a.label} {a.isDefault && <span className="text-xs text-[var(--foreground)]">Default</span>}
                </p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {a.fullName}
                  <br />
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.city}, {a.state} {a.postalCode}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={create} className="lx-card p-5 space-y-3">
        <h2 className="font-heading font-bold">Add address</h2>
        {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
        <div>
          <Label>Label</Label>
          <Input name="label" defaultValue="Home" />
        </div>
        <div>
          <Label>Full name</Label>
          <Input name="fullName" required />
        </div>
        <div>
          <Label>Line 1</Label>
          <Input name="line1" required />
        </div>
        <div>
          <Label>Line 2</Label>
          <Input name="line2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>City</Label>
            <Input name="city" required />
          </div>
          <div>
            <Label>State</Label>
            <Input name="state" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Postal</Label>
            <Input name="postalCode" required />
          </div>
          <div>
            <Label>Country</Label>
            <Input name="country" defaultValue="United States" />
          </div>
        </div>
        <div>
          <Label>Phone</Label>
          <Input name="phone" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isDefault" /> Default address
        </label>
        <Button type="submit" className="w-full">
          Save address
        </Button>
      </form>
    </div>
  );
}
