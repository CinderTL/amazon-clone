import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
  tone = "coral",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "coral" | "sky" | "mint" | "mustard";
}) {
  const tones = {
    coral: "bg-[var(--coral)] text-white",
    sky: "bg-[var(--sky)] text-white",
    mint: "bg-[var(--mint)] text-white",
    mustard: "bg-[var(--mustard)] text-[var(--text)]",
  };
  return (
    <span className={cn("inline-flex items-center lx-pill px-2 py-0.5 text-[11px] font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
