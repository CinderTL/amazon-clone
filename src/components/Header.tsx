import Link from "next/link";
import { Search, ShoppingCart, User, Heart } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";
import { NAV_CATEGORIES } from "@/lib/nav-categories";

export async function Header() {
  const session = await getSession();
  let cartCount = 0;

  if (session) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: { items: true },
    });
    cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)]">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-3 py-3">
          <Link href="/" className="shrink-0 font-heading text-2xl font-extrabold tracking-tight">
            Lixa<span className="text-[var(--coral)]">zon</span>
          </Link>

          <form action="/search" method="get" className="flex-1 flex min-w-0">
            <div className="flex w-full items-center lx-pill border border-[var(--border)] bg-[var(--surface)] overflow-hidden focus-within:ring-2 focus-within:ring-[var(--ring)]">
              <input
                type="search"
                name="q"
                placeholder="Search products, brands, categories…"
                className="flex-1 h-11 px-4 bg-transparent outline-none text-[var(--text)] min-w-0"
              />
              <button
                type="submit"
                className="h-11 w-12 flex items-center justify-center text-[var(--sky)] hover:bg-[var(--sky-soft)] transition"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            {session && (
              <Link
                href="/account/wishlist"
                className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-page)]"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}
            <Link
              href="/cart"
              className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-[var(--bg-page)]"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-[var(--coral)] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {session ? (
              <div className="flex items-center gap-1">
                <Link
                  href={session.role === "SELLER" ? "/seller/dashboard" : "/account"}
                  className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-full hover:bg-[var(--bg-page)] text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  {session.name.split(" ")[0]}
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 h-10 px-3 rounded-full hover:bg-[var(--bg-page)] text-sm font-medium"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <nav className="w-full border-t border-[var(--border)] bg-[var(--surface)]">
        <ul className="w-full flex items-stretch overflow-x-auto scrollbar-none">
          {NAV_CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.slug} className="flex-1 min-w-[7.5rem]">
                <Link
                  href={`/category/${c.slug}`}
                  className="group flex items-center justify-center gap-2 h-12 px-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-page)] border-b-2 border-transparent hover:border-[var(--sky)] transition-colors"
                >
                  <Icon className="h-4 w-4 shrink-0 text-[var(--sky)] group-hover:scale-110 transition-transform duration-200" />
                  <span className="whitespace-nowrap">{c.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="w-full mt-0 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="w-full px-4 md:px-8 lg:px-12 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-heading text-xl font-extrabold">
            Lixa<span className="text-[var(--coral)]">zon</span>
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm">
            A simple, colorful marketplace for buyers and sellers—focused workflows without the clutter.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Shop</p>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/search">Search</Link>
            </li>
            <li>
              <Link href="/account">Account</Link>
            </li>
            <li>
              <Link href="/cart">Cart</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Sell</p>
          <ul className="space-y-1 text-sm text-[var(--text-muted)]">
            <li>
              <Link href="/register">Open a store</Link>
            </li>
            <li>
              <Link href="/seller/dashboard">Seller dashboard</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} Lixazon. Demo marketplace.
      </div>
    </footer>
  );
}
