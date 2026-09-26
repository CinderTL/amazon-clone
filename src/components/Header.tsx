import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listCategories } from "@/services/catalog";
import { HeaderBar } from "@/components/header/HeaderBar";
import type { HeaderCategory, HeaderNotification, HeaderUser } from "@/components/header/types";

const CLOSED_STATUSES = new Set(["DELIVERED", "CANCELLED"]);

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export async function Header() {
  const user = await getCurrentUser();
  const categoryRows = await listCategories();
  let cartCount = 0;
  let notifications: HeaderNotification[] = [];

  if (user) {
    const [cart, orders] = await Promise.all([
      prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: true },
      }),
      prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: { id: true, orderNumber: true, status: true, updatedAt: true },
      }),
    ]);
    cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    notifications = orders.map((order) => ({
      id: order.id,
      title: `Order ${order.orderNumber}`,
      body: STATUS_LABEL[order.status] ?? order.status,
      href: `/account/orders`,
      active: !CLOSED_STATUSES.has(order.status),
    }));
  }

  const headerUser: HeaderUser | null = user
    ? {
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        authProvider: user.authProvider,
        isSeller: user.role === "SELLER" || Boolean(user.sellerProfile),
      }
    : null;

  const categories: HeaderCategory[] = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      imageUrl: child.imageUrl,
    })),
  }));

  return (
    <HeaderBar user={headerUser} categories={categories} cartCount={cartCount} notifications={notifications} />
  );
}

export function Footer() {
  return (
    <footer className="mt-0 w-full border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="grid w-full gap-8 px-4 py-10 sm:grid-cols-3 md:px-8 lg:px-12">
        <div>
          <p className="font-heading text-xl font-extrabold">
            Lixa<span className="text-[var(--signal)]">zon</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
            A simple, colorful marketplace for buyers and sellers—focused workflows without the clutter.
          </p>
        </div>
        <div>
          <p className="mb-2 font-semibold">Shop</p>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li>
              <Link href="/search" className="lx-focus rounded-sm">
                Search
              </Link>
            </li>
            <li>
              <Link href="/account" className="lx-focus rounded-sm">
                Account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="lx-focus rounded-sm">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold">Sell</p>
          <ul className="space-y-1 text-sm text-[var(--muted)]">
            <li>
              <Link href="/become-seller" className="lx-focus rounded-sm">
                Become a seller
              </Link>
            </li>
            <li>
              <Link href="/seller/dashboard" className="lx-focus rounded-sm">
                Seller dashboard
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Lixazon
      </div>
    </footer>
  );
}
