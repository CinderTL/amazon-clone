import Link from "next/link";
import { LayoutDashboard, Package, Warehouse, ShoppingBag, Store, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/inventory", label: "Inventory", icon: Warehouse },
  { href: "/seller/orders", label: "Orders", icon: ShoppingBag },
  { href: "/seller/store", label: "Store profile", icon: Store },
  { href: "/seller/settings", label: "Settings", icon: Settings },
];

export function SellerNav({ current }: { current?: string }) {
  return (
    <aside className="bg-white border border-mh-border rounded-lg p-3 w-full md:w-56 shrink-0 h-fit md:sticky md:top-24 self-start">
      <p className="text-xs font-bold text-mh-muted uppercase tracking-wide px-2 mb-2">Seller Central</p>
      <nav className="space-y-0.5">
        {links.map((l) => {
          const active = current === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2 px-2 py-2 rounded-md text-sm",
                active ? "bg-mh-soft font-bold" : "hover:bg-mh-soft"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <Link href="/" className="block mt-4 px-2 text-xs text-mh-link hover:underline">
        ← Back to Lixazon
      </Link>
    </aside>
  );
}

export function SellerShell({
  children,
  current,
  title,
}: {
  children: React.ReactNode;
  current: string;
  title: string;
}) {
  return (
    <div className="w-full px-3 md:px-4 py-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <SellerNav current={current} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
