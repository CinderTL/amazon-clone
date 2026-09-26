import { handleApiError, jsonOk, jsonError } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApiSession();
    const { id } = await context.params;
    const order = await prisma.order.findFirst({
      where: { id, userId: session.userId },
      include: { items: true },
    });
    if (!order) return jsonError("Not found", 404);
    return jsonOk({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
