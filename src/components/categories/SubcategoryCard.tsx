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
      className="lx-focus group block rounded-lg"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)] transition duration-200 hover:bg-[var(--elevated)]">
        <LoadingImage
          src={imageUrl}
          alt=""
          className="absolute inset-0"
          sizes="(max-width: 640px) 45vw, 18vw"
          fit="cover"
        />
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--signal)]">
        {name}
      </p>
    </Link>
  );
}
