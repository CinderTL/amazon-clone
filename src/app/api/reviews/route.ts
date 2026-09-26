import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { hasPurchasedProduct, refreshProductRating } from "@/services/reviews";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, "Write at least 10 characters").max(2000),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const product = await prisma.product.findFirst({
      where: { id: body.productId, active: true, status: "PUBLISHED" },
    });
    if (!product) return jsonError("Product not found", 404);
    if (!(await hasPurchasedProduct(session.userId, body.productId))) {
      return jsonError("You can only review products you purchased", 403);
    }

    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: body.productId, userId: session.userId } },
    });
    if (existing) return jsonError("You already reviewed this product. Edit your review instead.", 409);

    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        userId: session.userId,
        rating: body.rating,
        title: body.title || null,
        body: body.body,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    await refreshProductRating(body.productId);
    return jsonOk({ review }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
