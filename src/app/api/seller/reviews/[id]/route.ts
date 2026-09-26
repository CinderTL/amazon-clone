import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";

const schema = z.object({
  response: z.string().trim().min(2).max(2000),
});

async function ownedReview(reviewId: string, sellerId: string) {
  return prisma.review.findFirst({
    where: { id: reviewId, product: { sellerId } },
  });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    const review = await ownedReview(id, seller.id);
    if (!review) return jsonError("Review not found", 404);
    const body = schema.parse(await readJson(request));
    const updated = await prisma.review.update({
      where: { id },
      data: { sellerResponse: body.response, sellerRespondedAt: new Date() },
      include: {
        user: { select: { name: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
    });
    return jsonOk({ review: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { id } = await context.params;
    const review = await ownedReview(id, seller.id);
    if (!review) return jsonError("Review not found", 404);
    if (!review.sellerResponse) return jsonError("There is no response to delete", 400);
    const updated = await prisma.review.update({
      where: { id },
      data: { sellerResponse: null, sellerRespondedAt: null },
      include: {
        user: { select: { name: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
    });
    return jsonOk({ review: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
