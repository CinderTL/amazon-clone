import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    return jsonOk({ store: seller });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({
  storeName: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const body = schema.parse(await readJson(request));
    const store = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: body,
    });
    return jsonOk({ store });
  } catch (error) {
    return handleApiError(error);
  }
}
