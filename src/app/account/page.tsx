import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const links = [
  { href: "/account/orders", title: "Orders", desc: "Track purchases and receipts" },
  { href: "/account/addresses", title: "Addresses", desc: "Shipping destinations" },
  { href: "/account/wishlist", title: "Wishlist", desc: "Saved products" },
  { href: "/account/profile", title: "Profile", desc: "Name, phone, theme" },
  { href: "/account/settings", title: "Settings", desc: "Password and preferences" },
];

export default async function AccountPage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: session.userId } });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-heading text-3xl font-extrabold">Hi, {user?.name.split(" ")[0]}</h1>
      <p className="text-[var(--text-muted)] mt-1 mb-8">Manage your Lixazon account</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="lx-card p-5 block hover:border-[var(--sky)]">
            <h2 className="font-heading font-bold text-lg">{l.title}</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
