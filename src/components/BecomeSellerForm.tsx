"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Form";

export function BecomeSellerForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/seller/become", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: form.get("storeName"),
        description: form.get("description") || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not open your store");
      return;
    }
    router.push("/seller/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
      <div>
        <Label htmlFor="storeName">Store name</Label>
        <Input id="storeName" name="storeName" required minLength={2} />
      </div>
      <div>
        <Label htmlFor="description">Store description</Label>
        <Textarea id="description" name="description" placeholder="What do you sell?" />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Opening store…" : "Become a seller"}
      </Button>
    </form>
  );
}
