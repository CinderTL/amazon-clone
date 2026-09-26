import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("replace_me")) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function stripeStubEnabled() {
  if (process.env.STRIPE_TEST_STUB === "true") return true;
  const key = process.env.STRIPE_SECRET_KEY || "";
  return !key || key.includes("replace_me");
}
