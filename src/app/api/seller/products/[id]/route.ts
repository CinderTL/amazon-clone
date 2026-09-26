import { z } from "zod";
import { ShippingScope } from "@/generated/prisma/client";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { deleteSellerProduct, getSellerForUser, updateSellerProduct, updateSellerStock } from "@/services/seller";

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(8000).optional(),
  price: z.number().min(0).optional(),
  compareAt: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).max(8).optional(),
  brand: z.string().trim().max(80).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  shippingScope: z.enum([ShippingScope.INTERNATIONAL, ShippingScope.NATIONAL]).optional(),
  intent: z.enum(["draft", "publish"]),
});

const stockSchema = z.object({
  stock: z.number().int().min(0),
}).strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    const payload = await readJson<Record<string, unknown>>(request);
    if (stockSchema.safeParse(payload).success) {
      const product = await updateSellerStock(seller.id, id, stockSchema.parse(payload).stock);
      return jsonOk({ product });
    }
    const body = schema.parse(payload);
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
