import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/reviews", label: "Reviews" },
  { href: "/seller/store", label: "Store" },
  { href: "/seller/settings", label: "Settings" },
];

export function SellerShell({
  current,
  title,
  children,
}: {
  current: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 flex-1 overflow-x-hidden">
      <aside className="sticky top-28 z-30 flex h-[calc(100svh-7rem)] w-36 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--canvas)] px-2 py-4 sm:w-56 sm:px-3 lg:top-16 lg:h-[calc(100svh-4rem)]">
        <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">Seller</p>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "lx-focus block rounded px-2 py-2 text-sm sm:px-3",
                current === link.href ? "bg-[var(--elevated)] font-semibold text-[var(--signal)]" : "hover:bg-[var(--elevated)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="lx-focus mt-4 inline-flex items-center gap-1 px-2 text-xs text-[var(--signal)]">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to shop
        </Link>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <h1 className="mb-6 font-heading text-3xl font-extrabold">{title}</h1>
        {children}
      </div>
    </div>
  );
}
