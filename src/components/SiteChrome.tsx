"use client";

import { usePathname } from "next/navigation";
import { CategoriesPanelProvider } from "@/components/categories/CategoriesPanelContext";
import { cn } from "@/lib/utils";

const AUTH_PATHS = new Set(["/login", "/register"]);

export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.has(pathname);
  const isSeller = pathname.startsWith("/seller");

  return (
    <CategoriesPanelProvider>
      <div className={cn("flex min-h-svh flex-col", isAuth && "md:h-dvh md:max-h-dvh md:overflow-hidden")}>
        <div className="shrink-0">{header}</div>
        <main className={cn("flex min-h-0 w-full flex-1 flex-col overflow-x-hidden", isAuth && "md:overflow-hidden")}>
          {children}
        </main>
        {!isAuth && !isSeller && footer}
      </div>
    </CategoriesPanelProvider>
  );
}
