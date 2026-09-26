import { handleApiError, jsonError, jsonOk } from "@/lib/api";
import { getProductBySlug } from "@/services/catalog";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    if (!product || !product.active || product.status !== "PUBLISHED") return jsonError("Not found", 404);

    const related = await prisma.product.findMany({
      where: {
        active: true,
        status: "PUBLISHED",
        categoryId: product.categoryId ?? undefined,
        id: { not: product.id },
      },
      take: 8,
      include: { category: true, seller: true },
    });

    return jsonOk({ product, related });
  } catch (error) {
    return handleApiError(error);
  }
}
