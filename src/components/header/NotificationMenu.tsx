"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import type { HeaderNotification } from "@/components/header/types";

export function NotificationMenu({
  notifications,
  signedIn,
}: {
  notifications: HeaderNotification[];
  signedIn: boolean;
}) {
  const activeCount = notifications.filter((item) => item.active).length;

  return (
    <Popover
      label="Notifications"
      triggerClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-page)]"
      panelClassName="w-[min(20rem,calc(100vw-1.5rem))] p-0"
      trigger={
        <>
          <Bell className="h-5 w-5" aria-hidden />
          {signedIn && activeCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--coral)]" aria-hidden />
          )}
        </>
      }
    >
      <div>
          <p className="border-b border-[var(--border)] px-4 py-3 font-heading text-sm font-bold">Notifications</p>
          {!signedIn ? (
            <div className="px-4 py-4 text-sm text-[var(--text-muted)]">
              <p>Sign in to see updates about your orders.</p>
              <Link href="/login?next=/" className="mt-3 inline-flex font-semibold text-[var(--sky)]">
                Sign in
              </Link>
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-4 text-sm text-[var(--text-muted)]">
              You&apos;re all caught up. Order updates will show up here.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "lx-focus block px-4 py-3 hover:bg-[var(--bg-page)]",
                      item.active && "bg-[var(--sky-soft)]"
                    )}
                  >
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{item.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
    </Popover>
  );
}
