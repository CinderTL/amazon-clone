"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/components/CurrencyProvider";
import { CURRENCIES, MARKETS, marketByCountry } from "@/lib/markets";
import { cn } from "@/lib/utils";

export function LocaleMenu({ compact = false, align = "start" }: { compact?: boolean; align?: "start" | "end" }) {
  const { countryCode, currency, setMarket } = useCurrency();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState(countryCode);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const current = marketByCountry(countryCode);

  async function apply() {
    await setMarket(country, selectedCurrency);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "lx-focus inline-flex items-center gap-1 rounded px-2 py-2 text-sm font-semibold text-white hover:bg-white/15",
          compact && "px-1.5"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setCountry(countryCode);
          setSelectedCurrency(currency);
          setOpen((value) => !value);
        }}
      >
        <span className="truncate">{compact ? currency : `${current.countryCode} · ${currency}`}</span>
        <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Country and currency"
          className={cn(
            "lx-pop absolute top-full z-[60] mt-2 w-72 rounded border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--foreground)] shadow-none",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          <label className="block text-xs font-semibold text-[var(--muted)]" htmlFor="market-country">
            Country
          </label>
          <select
            id="market-country"
            className="mt-1 h-10 w-full rounded border border-[var(--border)] bg-[var(--canvas)] px-2"
            value={country}
            onChange={(event) => {
              const next = event.target.value;
              setCountry(next);
              setSelectedCurrency(marketByCountry(next).currency);
            }}
          >
            {MARKETS.map((market) => (
              <option key={market.countryCode} value={market.countryCode}>
                {market.country}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-semibold text-[var(--muted)]" htmlFor="market-currency">
            Currency
          </label>
          <select
            id="market-currency"
            className="mt-1 h-10 w-full rounded border border-[var(--border)] bg-[var(--canvas)] px-2"
            value={selectedCurrency}
            onChange={(event) => setSelectedCurrency(event.target.value)}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="lx-focus rounded px-3 py-2 text-sm hover:bg-[var(--elevated)]" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="lx-focus rounded bg-[var(--signal)] px-3 py-2 text-sm font-semibold text-[var(--canvas)]" onClick={apply}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
