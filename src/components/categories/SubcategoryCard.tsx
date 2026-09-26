"use client";

import Link from "next/link";
import { LoadingImage } from "@/components/LoadingImage";

export function SubcategoryCard({
  name,
  slug,
  imageUrl,
  onNavigate,
}: {
  name: string;
  slug: string;
  imageUrl: string | null;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={`/category/${slug}`}
      onClick={onNavigate}
      className="lx-focus group block rounded-2xl"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-page)] shadow-[var(--shadow)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-hover)]">
        <LoadingImage
          src={imageUrl}
          alt=""
          className="absolute inset-0"
          sizes="(max-width: 640px) 45vw, 18vw"
          fit="cover"
        />
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-[var(--text)] group-hover:text-[var(--sky)]">
        {name}
      </p>
    </Link>
  );
}
