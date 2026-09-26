"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Form";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type ReviewItem = {
  id: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  sellerResponse: string | null;
  sellerRespondedAt: string | null;
  user: { id: string; name: string };
};

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1" role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const filled = star <= value;
        if (!onChange) {
          return <Star key={star} className={cn("h-4 w-4", filled ? "fill-[var(--signal)] text-[var(--signal)]" : "text-[var(--border)]")} aria-hidden />;
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            className="lx-focus rounded p-0.5"
            onClick={() => onChange(star)}
          >
            <Star className={cn("h-5 w-5", filled ? "fill-[var(--signal)] text-[var(--signal)]" : "text-[var(--border)]")} />
          </button>
        );
      })}
    </div>
  );
}

export function ProductReviews({
  productId,
  storeName,
  reviews,
  average,
  count,
  distribution,
  canReview,
  signedIn,
  currentUserId,
}: {
  productId: string;
  storeName: string;
  reviews: ReviewItem[];
  average: number;
  count: number;
  distribution: Record<number, number>;
  canReview: boolean;
  signedIn: boolean;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const own = reviews.find((review) => review.userId === currentUserId) ?? null;
  const [editing, setEditing] = useState(!own && canReview);
  const [rating, setRating] = useState(own?.rating ?? 5);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      productId,
      rating,
      title: String(form.get("title") || ""),
      body: String(form.get("body") || ""),
    };
    if (payload.body.trim().length < 10) {
      setLoading(false);
      setError("Write at least 10 characters");
      return;
    }
    const res = await fetch(own ? `/api/reviews/${own.id}` : "/api/reviews", {
      method: own ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not save review");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!own) return;
    setLoading(true);
    const res = await fetch(`/api/reviews/${own.id}`, { method: "DELETE" });
    setLoading(false);
    setPendingDelete(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete review");
      return;
    }
    setEditing(true);
    router.refresh();
  }

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-heading text-2xl font-bold">Reviews</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <p className="text-3xl font-bold">{count ? average.toFixed(1) : "—"}</p>
          <Stars value={Math.round(average)} />
          <p className="mt-1 text-sm text-[var(--muted)]">{count} review{count === 1 ? "" : "s"}</p>
        </div>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const starCount = distribution[star] ?? 0;
            const width = count ? Math.round((starCount / count) * 100) : 0;
            return (
              <div key={star} className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs">
                <span>{star}★</span>
                <div className="h-2 overflow-hidden rounded bg-[var(--elevated)]">
                  <div className="h-full bg-[var(--signal)]" style={{ width: `${width}%` }} />
                </div>
                <span className="text-right text-[var(--muted)]">{starCount}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {reviews.length === 0 && (
            <div className="lx-card p-6 text-sm text-[var(--muted)]">No reviews yet. Buyers who purchase this product can leave the first one.</div>
          )}
          {reviews.map((review) => (
            <article key={review.id} className="lx-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-xs text-[var(--muted)]">{formatDate(review.updatedAt !== review.createdAt ? review.updatedAt : review.createdAt)}</p>
                </div>
                <Stars value={review.rating} />
              </div>
              {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
              <p className="mt-1 text-sm text-[var(--foreground)]">{review.body}</p>
              {review.userId === currentUserId && (
                <div className="mt-3 flex gap-3 text-sm">
                  <button type="button" className="lx-focus font-semibold text-[var(--signal)]" onClick={() => { setEditing(true); setRating(review.rating); }}>
                    Edit
                  </button>
                  <button type="button" className="lx-focus font-semibold text-[var(--signal)]" onClick={() => setPendingDelete(true)}>
                    Delete
                  </button>
                </div>
              )}
              {review.sellerResponse && (
                <div className="mt-3 border-l-2 border-[var(--signal)] bg-[var(--canvas)] px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--signal)]">Response from {storeName}</p>
                  {review.sellerRespondedAt && <p className="text-xs text-[var(--muted)]">{formatDate(review.sellerRespondedAt)}</p>}
                  <p className="mt-1 text-sm">{review.sellerResponse}</p>
                </div>
              )}
            </article>
          ))}
        </div>

        <div>
          {!signedIn && (
            <div className="lx-card p-4 text-sm text-[var(--muted)]">
              <Link href="/login" className="font-semibold text-[var(--signal)]">Sign in</Link> and purchase this product to write a review.
            </div>
          )}
          {signedIn && !canReview && !own && (
            <div className="lx-card p-4 text-sm text-[var(--muted)]">Purchase this product to leave a review.</div>
          )}
          {signedIn && (canReview || own) && editing && (
            <form onSubmit={onSubmit} className="lx-card space-y-3 p-4">
              <h3 className="font-heading font-bold">{own ? "Edit your review" : "Write a review"}</h3>
              {error && <p className="text-sm text-[var(--signal)]">{error}</p>}
              <div>
                <Label>Rating</Label>
                <Stars value={rating} onChange={setRating} />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={own?.title ?? ""} maxLength={120} />
              </div>
              <div>
                <Label htmlFor="body">Review</Label>
                <Textarea id="body" name="body" defaultValue={own?.body ?? ""} required minLength={10} maxLength={2000} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving…" : own ? "Update review" : "Submit review"}
              </Button>
            </form>
          )}
          {signedIn && own && !editing && (
            <div className="lx-card p-4 text-sm text-[var(--muted)]">You reviewed this product. Use Edit on your review to change it.</div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={remove}
        title="Delete your review?"
        description="This removes your rating and review text from the product."
        confirmLabel="Delete"
        destructive
        loading={loading}
      />
    </section>
  );
}
