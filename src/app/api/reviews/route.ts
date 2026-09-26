import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PaymentStatus, OrderStatus } from "@prisma/client";

const schema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const { productId } = body;

    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.userId,
          paymentStatus: PaymentStatus.SUCCEEDED,
          status: { not: OrderStatus.CANCELLED },
        },
      },
    });
    if (!purchased) {
      return jsonError("You can only review products you purchased", 403);
    }

    const review = await prisma.review.upsert({
      where: {
        productId_userId: { productId, userId: session.userId },
      },
      update: { rating: body.rating, title: body.title, body: body.body },
      create: {
        productId,
        userId: session.userId,
        rating: body.rating,
        title: body.title,
        body: body.body,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      },
    });

    return jsonOk({ review }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
