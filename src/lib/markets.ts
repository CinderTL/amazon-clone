export type MarketOption = {
  countryCode: string;
  country: string;
  currency: string;
};

export const MARKETS: MarketOption[] = [
  { countryCode: "US", country: "United States", currency: "USD" },
  { countryCode: "GB", country: "United Kingdom", currency: "GBP" },
  { countryCode: "DE", country: "Germany", currency: "EUR" },
  { countryCode: "FR", country: "France", currency: "EUR" },
  { countryCode: "CA", country: "Canada", currency: "CAD" },
  { countryCode: "AU", country: "Australia", currency: "AUD" },
  { countryCode: "JP", country: "Japan", currency: "JPY" },
  { countryCode: "IN", country: "India", currency: "INR" },
  { countryCode: "AE", country: "United Arab Emirates", currency: "AED" },
  { countryCode: "PK", country: "Pakistan", currency: "PKR" },
  { countryCode: "SG", country: "Singapore", currency: "SGD" },
  { countryCode: "BR", country: "Brazil", currency: "BRL" },
  { countryCode: "MX", country: "Mexico", currency: "MXN" },
  { countryCode: "SA", country: "Saudi Arabia", currency: "SAR" },
];

export const CURRENCIES = [...new Set(MARKETS.map((market) => market.currency))];

const CURRENCY_SET = new Set(CURRENCIES);
const COUNTRY_SET = new Set(MARKETS.map((market) => market.countryCode));

export function isCountryCode(value: string) {
  return COUNTRY_SET.has(value);
}

export function isCurrencyCode(value: string) {
  return CURRENCY_SET.has(value);
}

export function marketByCountry(countryCode: string) {
  return MARKETS.find((market) => market.countryCode === countryCode) ?? MARKETS[0];
}

export const MARKET_COOKIE = "lx-market";

export function parseMarketCookie(value: string | undefined | null) {
  if (!value) return null;
  const [countryCode, currency] = value.split(":");
  if (!countryCode || !currency || !isCountryCode(countryCode) || !isCurrencyCode(currency)) return null;
  return { countryCode, currency };
}

export function marketCookieValue(countryCode: string, currency: string) {
  return `${countryCode}:${currency}`;
}
