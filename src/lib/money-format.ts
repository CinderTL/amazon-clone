import { isCurrencyCode } from "@/lib/markets";

export const BASE_CURRENCY = "USD";

export function formatMoney(amountUsd: number, currency: string, rates: Record<string, number>) {
  const code = isCurrencyCode(currency) && rates[currency] != null ? currency : BASE_CURRENCY;
  const rate = rates[code] ?? 1;
  const digits = code === "JPY" ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amountUsd * rate);
}
