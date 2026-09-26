import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
  { href: "/seller/inventory", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-heading text-3xl font-extrabold mb-6">{title}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="lx-card p-3 w-full md:w-56 shrink-0 h-fit md:sticky md:top-28">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide px-2 mb-2">Seller</p>
          <nav className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "block px-3 py-2 rounded-xl text-sm",
                  current === l.href ? "bg-[var(--sky-soft)] text-[var(--sky)] font-semibold" : "hover:bg-[var(--bg-page)]"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="block mt-4 px-2 text-xs text-[var(--sky)]">
            ← Back to shop
          </Link>
        </aside>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
