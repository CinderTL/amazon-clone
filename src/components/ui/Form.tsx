import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-9 px-3 rounded-md border border-mh-input bg-white text-mh-text outline-none focus:border-mh-brand focus:ring-1 focus:ring-mh-brand",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full min-h-24 px-3 py-2 rounded-md border border-mh-input bg-white text-mh-text outline-none focus:border-mh-brand focus:ring-1 focus:ring-mh-brand",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full h-9 px-3 rounded-md border border-mh-input bg-white text-mh-text outline-none focus:border-mh-brand focus:ring-1 focus:ring-mh-brand",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-mh-text mb-1", className)}>
      {children}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-mh-danger mt-2">{message}</p>;
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-mh-success mt-2">{message}</p>;
}
