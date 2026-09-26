import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--signal)] text-[var(--canvas)] hover:opacity-90 disabled:bg-[var(--disabled)] disabled:text-[var(--canvas)]",
  secondary:
    "bg-[var(--elevated)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--signal)] disabled:bg-[var(--disabled)] disabled:text-[var(--muted)] disabled:border-[var(--disabled)]",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-[var(--elevated)] disabled:text-[var(--disabled)]",
  danger:
    "bg-[var(--signal)] text-[var(--canvas)] hover:opacity-90 disabled:bg-[var(--disabled)] disabled:text-[var(--canvas)]",
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
        "lx-focus inline-flex cursor-pointer items-center justify-center gap-2 rounded font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-100",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}
