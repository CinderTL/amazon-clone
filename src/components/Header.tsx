import Link from "next/link";
import { Search, ShoppingCart, MapPin, Menu, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/lib/actions";

export async function Header() {
  const session = await getSession();
  let cartCount = 0;
  let categories: { name: string; slug: string }[] = [];

  categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  if (session) {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      include: { items: true },
    });
    cartCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-mh-navy text-white">
        <div className="w-full px-3 md:px-4 flex items-center gap-2 md:gap-3 py-2">
          <Link href="/" className="flex items-center gap-1.5 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white shrink-0">
            <span className="text-xl font-bold tracking-tight">
              Lixa<span className="text-mh-brand">zon</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white text-xs shrink-0">
            <MapPin className="h-4 w-4" />
            <div>
              <div className="text-[11px] text-gray-300">Deliver to</div>
              <div className="font-bold">United States</div>
            </div>
          </div>

          <form action="/search" method="get" className="flex-1 flex min-w-0">
            <select
              name="category"
              className="hidden sm:block h-10 rounded-l-md border-0 bg-[#f3f3f3] text-mh-text text-xs px-2 max-w-[120px]"
              defaultValue=""
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="search"
              name="q"
              placeholder="Search Lixazon"
              className="flex-1 h-10 px-3 text-mh-text bg-white outline-none min-w-0"
            />
            <button
              type="submit"
              className="h-10 w-11 rounded-r-md bg-mh-brand text-mh-navy flex items-center justify-center hover:bg-[#f3a847]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="hidden lg:flex flex-col px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white text-xs">
            <span className="text-gray-300">EN</span>
            <span className="font-bold">USD</span>
          </div>

          {session ? (
            <div className="flex items-center gap-1">
              <Link
                href={session.role === "SELLER" ? "/seller/dashboard" : "/account"}
                className="hidden sm:flex flex-col px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white text-xs"
              >
                <span className="text-gray-300">Hello, {session.name.split(" ")[0]}</span>
                <span className="font-bold">
                  {session.role === "SELLER" ? "Seller Central" : "Account & Lists"}
                </span>
              </Link>
              <form action={logoutAction}>
                <button type="submit" className="text-xs px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white text-xs">
              <User className="h-4 w-4 sm:hidden" />
              <div className="hidden sm:block">
                <div className="text-gray-300">Hello, sign in</div>
                <div className="font-bold">Account & Lists</div>
              </div>
            </Link>
          )}

          <Link href="/account/orders" className="hidden md:flex flex-col px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white text-xs">
            <span className="text-gray-300">Returns</span>
            <span className="font-bold">& Orders</span>
          </Link>

          <Link href="/cart" className="relative flex items-end gap-1 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white">
            <div className="relative">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -top-1 left-3 text-mh-brand font-bold text-sm">{cartCount}</span>
            </div>
            <span className="hidden sm:inline font-bold text-sm pb-0.5">Cart</span>
          </Link>
        </div>
      </div>

      <nav className="bg-mh-navy-sub text-white">
        <div className="w-full px-3 md:px-4 flex items-center gap-1 py-1.5 text-sm overflow-x-auto">
          <Link href="/search" className="flex items-center gap-1 px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white shrink-0 font-bold">
            <Menu className="h-4 w-4" /> All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white whitespace-nowrap shrink-0"
            >
              {c.name}
            </Link>
          ))}
          {session?.role === "SELLER" && (
            <Link href="/seller/dashboard" className="px-2 py-1 rounded hover:outline hover:outline-1 hover:outline-white whitespace-nowrap shrink-0 text-mh-brand font-medium">
              Seller Dashboard
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto">
      <a href="#top" className="block bg-mh-navy-hover text-white text-center py-3 text-sm hover:bg-[#485769]">
        Back to top
      </a>
      <div className="bg-mh-navy-sub text-white">
        <div className="w-full px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-sm">
          <div>
            <h4 className="font-bold mb-2">Get to Know Us</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li><Link href="/" className="hover:underline">About Lixazon</Link></li>
              <li><Link href="/search" className="hover:underline">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Make Money with Us</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li><Link href="/register?role=SELLER" className="hover:underline">Sell on Lixazon</Link></li>
              <li><Link href="/seller/dashboard" className="hover:underline">Seller Central</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Let Us Help You</h4>
            <ul className="space-y-1.5 text-gray-300">
              <li><Link href="/account" className="hover:underline">Your Account</Link></li>
              <li><Link href="/account/orders" className="hover:underline">Your Orders</Link></li>
              <li><Link href="/cart" className="hover:underline">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Demo Accounts</h4>
            <ul className="space-y-1.5 text-gray-300 text-xs">
              <li>customer@example.com</li>
              <li>seller@example.com</li>
              <li>password: password123</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-mh-navy text-center py-6">
        <Link href="/" className="text-xl font-bold text-white">
          Lixa<span className="text-mh-brand">zon</span>
        </Link>
        <p className="text-gray-400 text-xs mt-2">© {new Date().getFullYear()} Lixazon — demo marketplace</p>
      </div>
    </footer>
  );
}
