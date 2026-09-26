import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { confirmCheckout } from "@/services/checkout";

const schema = z.object({
  orderId: z.string().min(1),
  paymentIntentId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const order = await confirmCheckout(session.userId, body.orderId, body.paymentIntentId);
    return jsonOk({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
