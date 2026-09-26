import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";
import { deleteStoreCategory, updateStoreCategory } from "@/services/store-categories";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    const body = schema.parse(await readJson(request));
    const category = await updateStoreCategory(seller.id, id, body);
    return jsonOk({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    await deleteStoreCategory(seller.id, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
