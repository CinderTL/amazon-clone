import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";
import { prisma } from "@/lib/db";
import { assertStoreImage } from "@/lib/uploads";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    return jsonOk({ store: seller });
  } catch (error) {
    return handleApiError(error);
  }
}

const imageField = z.string().trim().max(2000).nullable().optional();

const schema = z.object({
  storeName: z.string().trim().min(2).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  logoUrl: imageField,
  bannerUrl: imageField,
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const body = schema.parse(await readJson(request));
    const logoUrl = body.logoUrl?.trim() || null;
    const bannerUrl = body.bannerUrl?.trim() || null;
    await assertStoreImage(logoUrl);
    await assertStoreImage(bannerUrl);
    const store = await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: {
        ...(body.storeName != null ? { storeName: body.storeName } : {}),
        ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl } : {}),
        ...(body.bannerUrl !== undefined ? { bannerUrl } : {}),
      },
    });
    return jsonOk({ store });
  } catch (error) {
    return handleApiError(error);
  }
}
