import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "coral" | "sky" | "mint" | "mustard" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--sky)] text-white hover:opacity-90",
  secondary: "bg-[var(--surface-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--sky)]",
  ghost: "bg-transparent text-[var(--text)] hover:bg-[var(--bg-page)]",
  coral: "bg-[var(--coral)] text-white hover:opacity-90",
  sky: "bg-[var(--sky)] text-white hover:opacity-90",
  mint: "bg-[var(--mint)] text-white hover:opacity-90",
  mustard: "bg-[var(--mustard)] text-[var(--text)] hover:opacity-90",
  danger: "bg-[var(--coral)] text-white hover:opacity-90",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "lx-focus inline-flex items-center justify-center gap-2 font-medium lx-pill transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}
