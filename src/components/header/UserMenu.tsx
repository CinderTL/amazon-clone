"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, Settings, ShoppingCart, User } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { LoadingImage } from "@/components/LoadingImage";
import { accountInitial, hasThirdPartyAvatar } from "@/lib/utils";
import type { HeaderUser } from "@/components/header/types";

function MenuLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof User;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      tabIndex={-1}
      className="lx-focus flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-[var(--bg-page)]"
    >
      <Icon className="h-4 w-4 text-[var(--sky)]" aria-hidden />
      {label}
    </Link>
  );
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const initial = accountInitial(user.name, user.email);
  const showPhoto = hasThirdPartyAvatar(user);

  return (
    <Popover
      label="Account menu"
      panelRole="menu"
      triggerClassName="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--sky)] text-sm font-bold text-white"
      trigger={
        showPhoto ? (
          <LoadingImage
            src={user.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full"
            sizes="40px"
            fit="cover"
            fallback={<span aria-hidden>{initial}</span>}
          />
        ) : (
          <span aria-hidden>{initial}</span>
        )
      }
    >
      <div className="py-1">
          <p className="px-3 py-2 text-xs text-[var(--text-muted)]">
            <span className="block text-sm font-semibold text-[var(--text)]">{user.name}</span>
            {user.email}
          </p>
          <MenuLink href="/account/profile" label="User Profile" icon={User} />
          {user.isSeller && <MenuLink href="/seller/dashboard" label="Seller Dashboard" icon={LayoutDashboard} />}
          <MenuLink href="/account/wishlist" label="Wishlist" icon={Heart} />
          <MenuLink href="/cart" label="Cart" icon={ShoppingCart} />
          <MenuLink href="/account/settings" label="Settings" icon={Settings} />
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            className="lx-focus flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--coral)] hover:bg-[var(--bg-page)]"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign Out
          </button>
        </div>
    </Popover>
  );
}
