import { handleApiError, jsonOk } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireApiSession();
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
