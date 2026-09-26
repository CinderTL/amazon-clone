"use client";

import { createContext, useContext, useMemo, useRef } from "react";

type Opener = (button?: HTMLButtonElement | null) => void;

type CategoriesPanelApi = {
  register: (opener: Opener) => () => void;
  open: Opener;
};

const CategoriesPanelContext = createContext<CategoriesPanelApi | null>(null);

export function CategoriesPanelProvider({ children }: { children: React.ReactNode }) {
  const opener = useRef<Opener | null>(null);
  const api = useMemo<CategoriesPanelApi>(
    () => ({
      register(fn) {
        opener.current = fn;
        return () => {
          if (opener.current === fn) opener.current = null;
        };
      },
      open(button) {
        opener.current?.(button);
      },
    }),
    []
  );

  return <CategoriesPanelContext.Provider value={api}>{children}</CategoriesPanelContext.Provider>;
}

export function useCategoriesPanel() {
  const api = useContext(CategoriesPanelContext);
  if (!api) {
    throw new Error("Categories panel is unavailable");
  }
  return api;
}
