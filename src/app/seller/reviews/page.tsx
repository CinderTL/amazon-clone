import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { SellerReviews } from "@/components/seller/SellerReviews";

export const metadata = { title: "Seller Reviews" };

export default async function SellerReviewsPage() {
  const { seller } = await requireSeller();
  const reviews = await prisma.review.findMany({
    where: { product: { sellerId: seller.id } },
    include: {
      user: { select: { name: true } },
      product: { select: { id: true, name: true, slug: true, imageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SellerShell current="/seller/reviews" title="Reviews">
      <SellerReviews
        reviews={reviews.map((review) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
          sellerRespondedAt: review.sellerRespondedAt?.toISOString() ?? null,
        }))}
      />
    </SellerShell>
  );
}
