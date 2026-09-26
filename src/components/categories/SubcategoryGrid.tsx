"use client";

import Link from "next/link";
import { SubcategoryCard } from "@/components/categories/SubcategoryCard";
import type { HeaderCategory } from "@/components/header/types";

export function SubcategoryGrid({
  category,
  onNavigate,
  className,
}: {
  category: HeaderCategory | undefined;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <section aria-label={category ? `${category.name} subcategories` : "Subcategories"} className={className}>
      {!category ? (
        <p className="p-6 text-sm text-[var(--muted)]">No categories are available yet.</p>
      ) : (
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-heading text-2xl font-extrabold">{category.name}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">Choose a subcategory to browse products.</p>
            </div>
            <Link
              href={`/category/${category.slug}`}
              onClick={onNavigate}
              className="lx-focus text-sm font-semibold text-[var(--signal)]"
            >
              Shop all {category.name}
            </Link>
          </div>
          {category.children.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No subcategories in this department yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {category.children.map((child) => (
                <SubcategoryCard
                  key={child.id}
                  name={child.name}
                  slug={child.slug}
                  imageUrl={child.imageUrl}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
