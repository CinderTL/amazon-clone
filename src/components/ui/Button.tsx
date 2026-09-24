import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  children: ReactNode;
  variant?: "cta" | "buy" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  formAction?: (formData: FormData) => void;
};

const variants = {
  cta: "bg-gradient-to-b from-mh-cta-top to-mh-cta-bottom border border-mh-cta-border text-mh-text hover:brightness-95",
  buy: "bg-mh-buy border border-mh-cta-border text-mh-text hover:brightness-95",
  secondary: "bg-mh-soft border border-mh-border text-mh-text hover:bg-white",
  ghost: "bg-transparent border border-transparent text-mh-link hover:text-mh-link-hover hover:underline",
  danger: "bg-white border border-mh-danger text-mh-danger hover:bg-red-50",
};

const sizes = {
  sm: "h-8 px-3 text-xs rounded-md",
  md: "h-9 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-full",
};

export function Button({
  children,
  variant = "cta",
  size = "md",
  className,
  type = "button",
  disabled,
  onClick,
  formAction,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      formAction={formAction}
      className={cn(
        "inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
}
