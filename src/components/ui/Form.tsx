import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-10 px-4 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-24 px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none focus:ring-2 focus:ring-[var(--ring)] transition",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-[var(--text)] mb-1.5", className)} {...props} />;
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full h-10 px-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--ring)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
