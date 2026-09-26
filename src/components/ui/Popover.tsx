"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PopoverProps = {
  label: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  triggerClassName?: string;
  panelClassName?: string;
  panelRole?: "menu" | "dialog";
};

export function Popover({
  label,
  trigger,
  children,
  align = "end",
  triggerClassName,
  panelClassName,
  panelRole = "dialog",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  function closeFromSelection(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest("a, button")) return;
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (panelRole !== "menu" || !panelRef.current) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>("[role='menuitem']"));
      if (!items.length) return;
      event.preventDefault();
      const current = items.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else if (event.key === "ArrowDown") next = current < 0 ? 0 : (current + 1) % items.length;
      else next = current <= 0 ? items.length - 1 : current - 1;
      items[next]?.focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, panelRole]);

  useEffect(() => {
    if (!open || panelRole !== "menu" || !panelRef.current) return;
    const first = panelRef.current.querySelector<HTMLElement>("[role='menuitem']");
    first?.focus();
  }, [open, panelRole]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={cn("lx-focus", triggerClassName)}
        aria-label={label}
        aria-haspopup={panelRole}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role={panelRole}
          aria-label={label}
          onClick={closeFromSelection}
          className={cn(
            "lx-pop absolute top-[calc(100%+0.5rem)] z-[70] min-w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text)] shadow-[var(--shadow)]",
            align === "end" ? "right-0" : "left-0",
            panelClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
