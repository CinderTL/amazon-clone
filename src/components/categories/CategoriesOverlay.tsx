"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { DEFAULT_CATEGORY_SLUG } from "@/lib/category-catalog";
import { CategorySidebar } from "@/components/categories/CategorySidebar";
import { SubcategoryGrid } from "@/components/categories/SubcategoryGrid";
import type { HeaderCategory } from "@/components/header/types";

export function CategoriesOverlay({
  open,
  categories,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  categories: HeaderCategory[];
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(DEFAULT_CATEGORY_SLUG);
  const [trackedOpen, setTrackedOpen] = useState(open);

  if (open !== trackedOpen) {
    setTrackedOpen(open);
    if (open) {
      const match = categories.find((category) => category.slug === DEFAULT_CATEGORY_SLUG);
      setSelectedSlug(match?.slug ?? categories[0]?.slug ?? DEFAULT_CATEGORY_SLUG);
    }
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const returnFocus = returnFocusRef?.current ?? null;
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      returnFocus?.focus();
    };
  }, [open, returnFocusRef]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]")
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const selected = categories.find((category) => category.slug === selectedSlug) ?? categories[0];

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      id="categories-overlay"
      className="lx-overlay fixed inset-0 z-[80] flex h-dvh w-screen flex-col bg-[var(--canvas)] text-[var(--foreground)]"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3 md:px-6">
        <div className="group/title flex items-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close categories"
            className="lx-focus inline-flex h-9 w-0 items-center justify-center overflow-hidden rounded opacity-0 transition-all hover:bg-[var(--elevated)] group-hover/title:w-9 group-hover/title:opacity-100 group-focus-within/title:w-9 group-focus-within/title:opacity-100"
          >
            <X className="h-5 w-5 shrink-0" aria-hidden />
          </button>
          <h2 id={titleId} className="font-heading text-xl font-extrabold">
            Categories
          </h2>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="lx-focus inline-flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-sm font-semibold hover:bg-[var(--elevated)]"
        >
          <X className="h-4 w-4" aria-hidden />
          Close
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <CategorySidebar
          categories={categories}
          selectedSlug={selected?.slug ?? ""}
          onSelect={setSelectedSlug}
          className="max-h-[38vh] w-full shrink-0 overflow-y-auto border-b md:h-full md:max-h-none md:w-[30vw] md:min-w-[220px] md:max-w-[380px] md:border-b-0 md:border-r"
        />
        <SubcategoryGrid
          category={selected}
          onNavigate={onClose}
          className="min-h-0 flex-1 overflow-y-auto bg-[var(--canvas)]"
        />
      </div>
    </div>,
    document.body
  );
}
