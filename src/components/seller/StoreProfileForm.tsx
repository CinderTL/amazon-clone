"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Form";
import { StoreImagePicker } from "@/components/seller/StoreImagePicker";

export function StoreProfileForm({
  store,
}: {
  store: { storeName: string; slug: string; description: string | null; logoUrl: string | null; bannerUrl: string | null };
}) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(store.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/seller/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: form.get("storeName"),
        description: form.get("description") || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    setMessage(res.ok ? "Saved" : data.error || "Failed");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="lx-card max-w-xl space-y-4 p-5">
      <div>
        <Label>Store name</Label>
        <Input name="storeName" defaultValue={store.storeName} required />
        <p className="mt-1 text-sm text-[var(--muted)]">
          Public page:{" "}
          <Link href={`/store/${store.slug}`} className="text-[var(--signal)]">
            /store/{store.slug}
          </Link>
        </p>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea name="description" defaultValue={store.description || ""} />
      </div>
      <StoreImagePicker
        label="Store logo"
        hint="Upload a file or paste an image link. This is the store image shoppers see beside the name."
        value={logoUrl}
        onChange={setLogoUrl}
        disabled={saving}
      />
      <StoreImagePicker
        label="Store banner"
        hint="Upload a wide image or paste an image link for the top of the store page."
        value={bannerUrl}
        onChange={setBannerUrl}
        disabled={saving}
      />
      {message && <p className="text-sm text-[var(--foreground)]">{message}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save store"}
      </Button>
    </form>
  );
}
