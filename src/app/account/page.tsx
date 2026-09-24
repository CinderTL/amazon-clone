import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, MapPin, User, Settings, ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Your account" };

const links = [
  { href: "/account/orders", title: "Your Orders", desc: "Track, return, or buy again", icon: Package },
  { href: "/account/profile", title: "Login & security", desc: "Edit name, email, and phone", icon: User },
  { href: "/account/addresses", title: "Your Addresses", desc: "Edit addresses for orders", icon: MapPin },
  { href: "/account/settings", title: "Settings", desc: "Password and preferences", icon: Settings },
  { href: "/cart", title: "Cart", desc: "View items in your cart", icon: ShoppingBag },
];

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  return (
    <div className="w-full px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Your Account</h1>
      <p className="text-mh-muted mb-6">Hello, {session.name}</p>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex gap-3 bg-white border border-mh-border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <l.icon className="h-8 w-8 text-mh-navy-sub shrink-0" />
            <div>
              <h2 className="font-bold">{l.title}</h2>
              <p className="text-sm text-mh-muted">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
