"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/money-format";
import { MARKET_COOKIE, marketCookieValue, marketByCountry } from "@/lib/markets";

type CurrencyContextValue = {
  countryCode: string;
  currency: string;
  rates: Record<string, number>;
  format: (amountUsd: number) => string;
  setMarket: (countryCode: string, currency: string) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  countryCode,
  currency,
  rates,
  children,
}: {
  countryCode: string;
  currency: string;
  rates: Record<string, number>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [market, setMarketState] = useState({ countryCode, currency, rates });
  const [previous, setPrevious] = useState({ countryCode, currency, rates });
  if (countryCode !== previous.countryCode || currency !== previous.currency || rates !== previous.rates) {
    setPrevious({ countryCode, currency, rates });
    setMarketState({ countryCode, currency, rates });
  }

  const value = useMemo<CurrencyContextValue>(
    () => ({
      countryCode: market.countryCode,
      currency: market.currency,
      rates: market.rates,
      format: (amountUsd: number) => formatMoney(amountUsd, market.currency, market.rates),
      setMarket: async (nextCountry, nextCurrency) => {
        const country = marketByCountry(nextCountry).countryCode;
        document.cookie = `${MARKET_COOKIE}=${marketCookieValue(country, nextCurrency)}; Path=/; Max-Age=31536000; SameSite=Lax`;
        setMarketState((current) => ({ ...current, countryCode: country, currency: nextCurrency }));
        await fetch("/api/market", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: country, currency: nextCurrency }),
        });
        router.refresh();
      },
    }),
    [market, router]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}

export function Price({ amount }: { amount: number }) {
  const { format } = useCurrency();
  return <>{format(amount)}</>;
}
