import { z } from "zod";
import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getApiSession } from "@/lib/session";

const schema = z.object({
  productId: z.string().min(1),
  durationMs: z.number().int().min(8000).max(30 * 60 * 1000),
});

export async function POST(request: Request) {
  try {
    const session = await getApiSession();
    if (!session) return jsonOk({ ok: true });
    const raw = await request.text();
    const body = schema.parse(raw ? JSON.parse(raw) : {});
    const product = await prisma.product.findFirst({
      where: { id: body.productId, active: true, status: "PUBLISHED" },
      include: { category: { select: { id: true, parentId: true } } },
    });
    if (!product?.category) return jsonOk({ ok: true });

    const categoryId = product.category.parentId ?? product.category.id;
    const subcategoryId = product.category.parentId ? product.category.id : null;
    const since = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await prisma.productView.findFirst({
      where: { userId: session.userId, productId: product.id, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });

    if (recent) {
      await prisma.productView.update({
        where: { id: recent.id },
        data: { durationMs: Math.max(recent.durationMs, body.durationMs) },
      });
    } else {
      await prisma.productView.create({
        data: {
          userId: session.userId,
          productId: product.id,
          categoryId,
          subcategoryId,
          durationMs: body.durationMs,
        },
      });
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
