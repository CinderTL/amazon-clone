import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { isCountryCode, isCurrencyCode } from "@/lib/markets";
import { getApiSession } from "@/lib/session";

const schema = z.object({
  countryCode: z.string().refine(isCountryCode),
  currency: z.string().refine(isCurrencyCode),
});

export async function PATCH(request: Request) {
  try {
    const session = await getApiSession();
    const body = schema.parse(await readJson(request));
    if (session) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { countryCode: body.countryCode, currencyCode: body.currency },
      });
    }
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
