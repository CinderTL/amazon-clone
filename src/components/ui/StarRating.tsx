import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, count, size = "sm" }: { rating: number; count?: number; size?: "sm" | "md" }) {
  const full = Math.floor(rating);
  const starSize = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < full ? "fill-[var(--mustard)] text-[var(--mustard)]" : "fill-[var(--border)] text-[var(--border)]"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-[var(--sky)]">{rating.toFixed(1)}</span>
      {count != null && <span className="text-xs text-[var(--text-muted)]">({count.toLocaleString()})</span>}
    </div>
  );
}
