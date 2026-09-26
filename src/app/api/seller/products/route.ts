import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { createSellerProduct, getSellerForUser, listSellerProducts } from "@/services/seller";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const products = await listSellerProducts(seller.id);
    return jsonOk({ products });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  compareAt: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url(),
  images: z.array(z.string().url()).optional(),
  brand: z.string().optional(),
  categoryId: z.string().min(1),
  featured: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const body = schema.parse(await readJson(request));
    const product = await createSellerProduct(seller.id, body);
    return jsonOk({ product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
