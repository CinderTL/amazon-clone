"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart, Store, X } from "lucide-react";
import { CategoriesOverlay } from "@/components/categories/CategoriesOverlay";
import { useCategoriesPanel } from "@/components/categories/CategoriesPanelContext";
import { LocaleMenu } from "@/components/header/LocaleMenu";
import { NotificationMenu } from "@/components/header/NotificationMenu";
import { UserMenu } from "@/components/header/UserMenu";
import type { HeaderCategory, HeaderNotification, HeaderUser } from "@/components/header/types";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link href="/" className="lx-focus shrink-0 font-heading text-xl font-extrabold tracking-tight text-white lg:text-2xl">
      Lixa<span>zon</span>
    </Link>
  );
}

function SearchForm({
  className,
  inputRef,
}: {
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <form action="/search" method="get" className={cn("lx-search min-w-0", className)} role="search">
      <div className="flex w-full items-center overflow-hidden rounded-full border border-transparent bg-white focus-within:ring-2 focus-within:ring-white/70">
        <input
          ref={inputRef}
          type="search"
          name="q"
          placeholder="Search products, brands, categories…"
          className="h-11 min-w-0 flex-1 bg-white px-5 text-[#111111] outline-none placeholder:text-[#666666]"
          aria-label="Search"
        />
        <button
          type="submit"
          className="lx-focus inline-flex h-11 w-12 shrink-0 items-center justify-center bg-white text-[#111111] hover:bg-[#f3f3f3]"
          aria-label="Search"
        >
          <Search className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="lx-focus relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/15"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C62828] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

function BecomeSellerLink({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "lx-focus inline-flex items-center justify-center gap-1.5 rounded px-3 py-2 text-sm font-semibold text-white hover:bg-white/15",
        className
      )}
    >
      <Store className="h-4 w-4" aria-hidden />
      Become a Seller
    </Link>
  );
}

function CategoriesButton({
  className,
  expanded,
  onOpen,
}: {
  className?: string;
  expanded: boolean;
  onOpen: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "lx-focus inline-flex items-center gap-2 rounded px-2 py-2 text-sm font-semibold text-white hover:bg-white/15 sm:px-3",
        className
      )}
      aria-expanded={expanded}
      aria-controls="categories-overlay"
      onClick={(event) => onOpen(event.currentTarget)}
    >
      <Menu className="h-5 w-5 shrink-0" aria-hidden />
      <span className="truncate">Categories</span>
    </button>
  );
}

function AccountSlot({ user }: { user: HeaderUser | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="lx-focus inline-flex h-10 items-center rounded bg-white px-3 text-sm font-semibold text-[#FF5A00] hover:bg-white/90"
      >
        Sign In
      </Link>
    );
  }
  return <UserMenu user={user} />;
}

export function HeaderBar({
  user,
  categories,
  cartCount,
  notifications,
}: {
  user: HeaderUser | null;
  categories: HeaderCategory[];
  cartCount: number;
  notifications: HeaderNotification[];
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panel = useCategoriesPanel();
  const pathname = usePathname();
  const [pathSnapshot, setPathSnapshot] = useState(pathname);
  const showBecomeSeller = !user || !user.isSeller;
  const becomeHref = user ? "/become-seller" : "/login?next=/become-seller";

  if (pathname !== pathSnapshot) {
    setPathSnapshot(pathname);
    if (categoriesOpen) setCategoriesOpen(false);
    if (searchOpen) setSearchOpen(false);
  }

  useEffect(() => {
    return panel.register((button) => {
      if (button) categoriesButtonRef.current = button;
      setCategoriesOpen(true);
    });
  }, [panel]);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function openCategories(button: HTMLButtonElement) {
    categoriesButtonRef.current = button;
    setCategoriesOpen(true);
  }

  return (
    <header className="lx-header sticky top-0 z-50 w-full border-b border-[#C44700] bg-[#FF5A00] text-white">
      <div className="hidden h-16 items-center gap-4 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <div className="flex items-center justify-self-start">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          <CategoriesButton expanded={categoriesOpen} onOpen={openCategories} />
          <SearchForm className="w-[min(34rem,34vw)]" />
          <LocaleMenu align="end" />
        </div>
        <div className="flex items-center justify-self-end gap-1">
          {showBecomeSeller && <BecomeSellerLink href={becomeHref} />}
          <NotificationMenu notifications={notifications} signedIn={Boolean(user)} />
          <CartLink count={cartCount} />
          <AccountSlot user={user} />
        </div>
      </div>

      <div className="px-3 py-2 lg:hidden">
        <div className="flex h-12 items-center gap-1">
          <Logo />
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              className="lx-focus inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/15"
              aria-label={searchOpen ? "Close search" : "Search"}
              aria-expanded={searchOpen}
              aria-controls="mobile-search"
              onClick={() => setSearchOpen((open) => !open)}
            >
              {searchOpen ? <X className="h-5 w-5" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
            </button>
            <NotificationMenu notifications={notifications} signedIn={Boolean(user)} />
            <CartLink count={cartCount} />
            <AccountSlot user={user} />
          </div>
        </div>
        {searchOpen && (
          <div id="mobile-search" className="pb-2">
            <SearchForm inputRef={searchInputRef} />
          </div>
        )}
      </div>

      <CategoriesOverlay
        open={categoriesOpen}
        categories={categories}
        onClose={() => setCategoriesOpen(false)}
        returnFocusRef={categoriesButtonRef}
      />
    </header>
  );
}
