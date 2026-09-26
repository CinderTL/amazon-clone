import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { deleteSellerProduct, getSellerForUser, updateSellerProduct } from "@/services/seller";

const schema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  price: z.number().positive().optional(),
  compareAt: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  brand: z.string().nullable().optional(),
  categoryId: z.string().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    const body = schema.parse(await readJson(request));
    const product = await updateSellerProduct(seller.id, id, body);
    return jsonOk({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    await deleteSellerProduct(seller.id, id);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
