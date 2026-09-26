import { handleApiError, jsonOk, jsonError } from "@/lib/api";
import { getStripe } from "@/lib/stripe";
import { markOrderPaidByIntent } from "@/services/checkout";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return jsonError("Stripe not configured", 503);
    }
    const sig = request.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !secret || secret.includes("replace_me")) {
      return jsonError("Webhook not configured", 503);
    }
    const raw = await request.text();
    const event = stripe.webhooks.constructEvent(raw, sig, secret);
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as { id: string };
      await markOrderPaidByIntent(intent.id);
    }
    return jsonOk({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}
