import { z } from "zod";
import { ShippingScope } from "@/generated/prisma/client";
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
