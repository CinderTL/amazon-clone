import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";
import { createStoreCategory, listSellerCategories } from "@/services/store-categories";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().trim().max(2000).nullable().optional(),
});

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const categories = await listSellerCategories(seller.id);
    return jsonOk({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const body = schema.parse(await readJson(request));
    const category = await createStoreCategory(seller.id, body);
    return jsonOk({ category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
