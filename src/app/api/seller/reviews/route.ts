import { handleApiError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const reviews = await prisma.review.findMany({
      where: { product: { sellerId: seller.id } },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ reviews });
  } catch (error) {
    return handleApiError(error);
  }
}
