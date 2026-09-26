"use client";

import { Check } from "lucide-react";
import { categoryIcon } from "@/components/categories/category-icons";
import { cn } from "@/lib/utils";
import type { HeaderCategory } from "@/components/header/types";

export function CategorySidebar({
  categories,
  selectedSlug,
  onSelect,
  className,
}: {
  categories: HeaderCategory[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  className?: string;
}) {
  return (
    <nav aria-label="Major categories" className={cn("border-[var(--border)] bg-[var(--surface)]", className)}>
      <ul className="flex flex-col gap-1 p-2 md:p-3">
        {categories.map((category) => {
          const active = category.slug === selectedSlug;
          const Icon = categoryIcon(category.slug);
          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(category.slug)}
                className={cn(
                  "lx-focus flex min-h-[3.25rem] w-full items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "border-[var(--signal)] bg-[var(--elevated)] font-semibold text-[var(--foreground)]"
                    : "border-transparent text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-[var(--signal)]" aria-hidden />
                <span className="min-w-0 flex-1">{category.name}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-[var(--signal)]" aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
