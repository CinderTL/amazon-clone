import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isCurrencyCode, marketByCountry, MARKET_COOKIE, parseMarketCookie } from "@/lib/markets";
import { BASE_CURRENCY, formatMoney } from "@/lib/money-format";

export { BASE_CURRENCY, formatMoney };

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149,
  INR: 83.5,
  AED: 3.67,
  PKR: 278,
  SGD: 1.34,
  BRL: 5.4,
  MXN: 18.2,
  SAR: 3.75,
};

type RateCache = { at: number; rates: Record<string, number> };
const globalRates = globalThis as typeof globalThis & { __lxRates?: RateCache };

function withFallback(rates: Record<string, number>) {
  return { ...FALLBACK_RATES, ...rates, USD: 1 };
}

export async function getUsdRates() {
  const cached = globalRates.__lxRates;
  if (cached && Date.now() - cached.at < 6 * 60 * 60 * 1000) return cached.rates;

  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD", { next: { revalidate: 21600 } });
    if (!response.ok) throw new Error("Rate feed unavailable");
    const data = (await response.json()) as { rates?: Record<string, number> };
    const rates = withFallback(data.rates ?? {});
    globalRates.__lxRates = { at: Date.now(), rates };
    return rates;
  } catch {
    return cached?.rates ?? { ...FALLBACK_RATES };
  }
}

export async function getMarket() {
  const rates = await getUsdRates();
  let countryCode = "US";
  let currency = BASE_CURRENCY;

  try {
    const cookieStore = await cookies();
    const parsed = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
    if (parsed) {
      countryCode = parsed.countryCode;
      currency = parsed.currency;
    } else {
      const session = await getSession();
      if (session) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { countryCode: true, currencyCode: true },
        });
        if (user?.countryCode && user.currencyCode && isCurrencyCode(user.currencyCode)) {
          countryCode = marketByCountry(user.countryCode).countryCode === user.countryCode ? user.countryCode : "US";
          currency = user.currencyCode;
        }
      }
    }
  } catch {
    countryCode = "US";
    currency = BASE_CURRENCY;
  }

  return { countryCode, currency, rates };
}
