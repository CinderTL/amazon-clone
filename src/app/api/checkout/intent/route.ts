import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { createCheckoutIntent } from "@/services/checkout";

const schema = z.object({ addressId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const result = await createCheckoutIntent(session.userId, body.addressId);
    return jsonOk(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
