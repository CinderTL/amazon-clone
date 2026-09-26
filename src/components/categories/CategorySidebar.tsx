"use client";

import {
  Baby,
  Car,
  Check,
  Dumbbell,
  Gem,
  Headphones,
  HeartPulse,
  Home,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeaderCategory } from "@/components/header/types";

const ICONS: Record<string, LucideIcon> = {
  "electronic-accessories": Headphones,
  "tv-home-appliances": Tv,
  "health-beauty": HeartPulse,
  "mother-baby": Baby,
  "electronic-devices": Smartphone,
  "groceries-pets": ShoppingBasket,
  "home-lifestyle": Home,
  "womens-fashion": Shirt,
  "mens-fashion": Shirt,
  "kids-fashion": Baby,
  "watches-bags-jewellery": Watch,
  "sports-outdoor": Dumbbell,
  "automotive-motorbike": Car,
};

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
      <ul className="flex flex-col p-2 md:p-3">
        {categories.map((category) => {
          const active = category.slug === selectedSlug;
          const Icon = ICONS[category.slug] ?? Gem;
          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(category.slug)}
                className={cn(
                  "lx-focus flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-left text-sm transition-colors",
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
