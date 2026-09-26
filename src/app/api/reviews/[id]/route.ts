import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { refreshProductRating } from "@/services/reviews";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10).max(2000),
});

async function ownReview(reviewId: string, userId: string) {
  const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
  if (!review) return null;
  return review;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession();
    const { id } = await context.params;
    const review = await ownReview(id, session.userId);
    if (!review) return jsonError("Review not found", 404);
    const body = schema.parse(await readJson(request));
    const updated = await prisma.review.update({
      where: { id },
      data: { rating: body.rating, title: body.title || null, body: body.body },
      include: { user: { select: { id: true, name: true } } },
    });
    await refreshProductRating(review.productId);
    return jsonOk({ review: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession();
    const { id } = await context.params;
    const review = await ownReview(id, session.userId);
    if (!review) return jsonError("Review not found", 404);
    await prisma.review.delete({ where: { id } });
    await refreshProductRating(review.productId);
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
