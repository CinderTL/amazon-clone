"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart, Store } from "lucide-react";
import { CategoriesOverlay } from "@/components/categories/CategoriesOverlay";
import { NotificationMenu } from "@/components/header/NotificationMenu";
import { UserMenu } from "@/components/header/UserMenu";
import type { HeaderCategory, HeaderNotification, HeaderUser } from "@/components/header/types";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link href="/" className="lx-focus shrink-0 font-heading text-xl font-extrabold tracking-tight lg:text-2xl">
      Lixa<span className="text-[var(--coral)]">zon</span>
    </Link>
  );
}

function SearchForm({ className }: { className?: string }) {
  return (
    <form action="/search" method="get" className={cn("min-w-0", className)} role="search">
      <div className="flex w-full items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] focus-within:ring-2 focus-within:ring-[var(--ring)]">
        <input
          type="search"
          name="q"
          placeholder="Search products, brands, categories…"
          className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[var(--text)] outline-none"
          aria-label="Search"
        />
        <button
          type="submit"
          className="lx-focus inline-flex h-11 w-12 items-center justify-center text-[var(--sky)] hover:bg-[var(--sky-soft)]"
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
      className="lx-focus relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-page)]"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
    >
      <ShoppingCart className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--coral)] px-1 text-[10px] font-bold text-white">
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
        "lx-focus inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-[var(--sky)] hover:bg-[var(--sky-soft)]",
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
        "lx-focus inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold hover:bg-[var(--bg-page)] sm:px-3",
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
        className="lx-focus inline-flex h-10 items-center rounded-full bg-[var(--sky)] px-3 text-sm font-semibold text-white hover:opacity-90"
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
  const categoriesButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [pathSnapshot, setPathSnapshot] = useState(pathname);
  const showBecomeSeller = !user || !user.isSeller;
  const becomeHref = user ? "/become-seller" : "/login?next=/become-seller";

  if (pathname !== pathSnapshot) {
    setPathSnapshot(pathname);
    if (categoriesOpen) setCategoriesOpen(false);
  }

  function openCategories(button: HTMLButtonElement) {
    categoriesButtonRef.current = button;
    setCategoriesOpen(true);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md">
      <div className="hidden h-16 items-center gap-4 px-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <div className="justify-self-start">
          <CategoriesButton expanded={categoriesOpen} onOpen={openCategories} />
        </div>
        <div className="flex items-center gap-3">
          <Logo />
          <SearchForm className="w-[min(34rem,34vw)]" />
          <CartLink count={cartCount} />
        </div>
        <div className="flex items-center justify-self-end gap-1">
          {showBecomeSeller && <BecomeSellerLink href={becomeHref} />}
          <NotificationMenu notifications={notifications} signedIn={Boolean(user)} />
          <AccountSlot user={user} />
        </div>
      </div>

      <div className="space-y-2 px-3 py-2 lg:hidden">
        <div className="relative flex h-12 items-center">
          <CategoriesButton
            expanded={categoriesOpen}
            onOpen={openCategories}
            className="relative z-10 max-w-[42%]"
          />
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2">
            <span className="pointer-events-auto">
              <Logo />
            </span>
          </div>
          <div className="relative z-10 ml-auto flex items-center gap-1">
            <NotificationMenu notifications={notifications} signedIn={Boolean(user)} />
            <AccountSlot user={user} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SearchForm className="min-w-0 flex-1" />
          <CartLink count={cartCount} />
        </div>
        {showBecomeSeller && <BecomeSellerLink href={becomeHref} className="w-full" />}
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
