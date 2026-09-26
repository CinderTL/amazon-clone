"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { ProductImage } from "@/components/ProductImage";
import { formatDate } from "@/lib/utils";

type SellerReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  sellerResponse: string | null;
  sellerRespondedAt: string | null;
  user: { name: string };
  product: { id: string; name: string; slug: string; imageUrl: string };
};

export function SellerReviews({ reviews }: { reviews: SellerReview[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function save(review: SellerReview) {
    const response = (drafts[review.id] ?? review.sellerResponse ?? "").trim();
    if (response.length < 2) {
      setError("Write a response of at least 2 characters");
      return;
    }
    setLoadingId(review.id);
    setError("");
    const res = await fetch(`/api/seller/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok) {
      setError(data.error || "Could not save response");
      return;
    }
    setOpenId(null);
    router.refresh();
  }

  async function remove() {
    if (!pendingDelete) return;
    setLoadingId(pendingDelete);
    const res = await fetch(`/api/seller/reviews/${pendingDelete}`, { method: "DELETE" });
    setLoadingId(null);
    setPendingDelete(null);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete response");
      return;
    }
    router.refresh();
  }

  if (!reviews.length) {
    return <div className="lx-card p-8 text-center text-sm text-[var(--muted)]">No reviews on your products yet.</div>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
      {reviews.map((review) => {
        const editing = openId === review.id;
        return (
          <article key={review.id} className="lx-card p-4">
            <div className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-[var(--elevated)]">
                <ProductImage src={review.product.imageUrl} alt="" className="absolute inset-0" sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${review.product.slug}`} className="font-semibold hover:text-[var(--signal)]">
                  {review.product.name}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <span>{review.user.name}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--foreground)]">
                    <Star className="h-3.5 w-3.5 fill-[var(--signal)] text-[var(--signal)]" aria-hidden />
                    {review.rating}
                  </span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
                {review.title && <p className="mt-2 font-medium">{review.title}</p>}
                <p className="mt-1 text-sm">{review.body}</p>
                {review.sellerResponse && !editing && (
                  <div className="mt-3 border-l-2 border-[var(--signal)] px-3 py-2 text-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--signal)]">Your response</p>
                    {review.sellerRespondedAt && <p className="text-xs text-[var(--muted)]">{formatDate(review.sellerRespondedAt)}</p>}
                    <p className="mt-1">{review.sellerResponse}</p>
                  </div>
                )}
                {editing && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      value={drafts[review.id] ?? review.sellerResponse ?? ""}
                      onChange={(event) => setDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                      maxLength={2000}
                    />
                    <div className="flex gap-2">
                      <Button type="button" size="sm" disabled={loadingId === review.id} onClick={() => save(review)}>
                        {loadingId === review.id ? "Saving…" : "Save response"}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setOpenId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {!editing && (
                  <div className="mt-3 flex gap-3 text-sm">
                    <button type="button" className="lx-focus font-semibold text-[var(--signal)]" onClick={() => setOpenId(review.id)}>
                      {review.sellerResponse ? "Edit response" : "Respond"}
                    </button>
                    {review.sellerResponse && (
                      <button type="button" className="lx-focus font-semibold text-[var(--signal)]" onClick={() => setPendingDelete(review.id)}>
                        Delete response
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title="Delete your response?"
        description="The customer review stays. Only your reply is removed."
        confirmLabel="Delete"
        destructive
        loading={loadingId !== null}
      />
    </div>
  );
}
