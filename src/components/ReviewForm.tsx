"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Form";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        rating: Number(form.get("rating")),
        title: form.get("title"),
        body: form.get("body"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save review");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="lx-card p-4 space-y-3">
      <h3 className="font-heading font-bold">Write a review</h3>
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
      <div>
        <Label htmlFor="rating">Rating</Label>
        <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} required />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" />
      </div>
      <div>
        <Label htmlFor="body">Review</Label>
        <Textarea id="body" name="body" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : "Submit review"}
      </Button>
    </form>
  );
}
