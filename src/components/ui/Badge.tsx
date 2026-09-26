import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-[var(--signal)] px-2 py-0.5 text-[11px] font-semibold text-[var(--canvas)]",
        className
      )}
    >
      {children}
    </span>
  );
}
