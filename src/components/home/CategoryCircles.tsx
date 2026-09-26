"use client";

import Link from "next/link";
import { categoryIcon } from "@/components/categories/category-icons";
import { useCategoriesPanel } from "@/components/categories/CategoriesPanelContext";

export type CircleCategory = {
  id: string;
  name: string;
  slug: string;
};

export function CategoryCircles({ categories }: { categories: CircleCategory[] }) {
  const panel = useCategoriesPanel();

  if (!categories.length) {
    return (
      <section className="w-full px-4 py-6 md:px-8 lg:px-12" aria-labelledby="home-categories-heading">
        <h2 id="home-categories-heading" className="font-heading text-xl font-extrabold">
          Categories
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">No categories yet.</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full px-4 py-6 md:px-8 lg:px-12" aria-labelledby="home-categories-heading">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="home-categories-heading" className="font-heading text-xl font-extrabold">
          Categories
        </h2>
        <button
          type="button"
          className="lx-focus rounded px-2 py-1 text-sm font-semibold text-[var(--signal)] hover:bg-[var(--elevated)] lg:hidden"
          aria-haspopup="dialog"
          aria-controls="categories-overlay"
          onClick={(event) => panel.open(event.currentTarget)}
        >
          View All
        </button>
      </div>
      <div className="lx-scroll-x max-w-full py-1">
        <ul className="flex w-max min-w-full flex-nowrap items-start justify-between gap-4 lg:gap-8">
          {categories.map((category) => {
            const Icon = categoryIcon(category.slug);
            return (
              <li key={category.id} className="shrink-0">
                <Link
                  href={`/category/${category.slug}`}
                  className="lx-focus group flex w-20 flex-col items-center gap-2 rounded-lg text-center"
                  onFocus={(event) => event.currentTarget.scrollIntoView({ inline: "nearest", block: "nearest" })}
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#050505] bg-[#fcfcfc] text-[var(--signal)] transition-colors group-hover:border-[var(--signal)] group-focus-visible:border-[var(--signal)]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="line-clamp-3 text-xs font-medium leading-4 text-[var(--foreground)]">
                    {category.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function CategoryCirclesSkeleton() {
  return (
    <section className="w-full px-4 py-6 md:px-8 lg:px-12" aria-hidden>
      <div className="shimmer mb-4 h-7 w-36 rounded" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex w-20 shrink-0 flex-col items-center gap-2">
            <div className="shimmer h-16 w-16 rounded-full" />
            <div className="shimmer h-3 w-14 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
