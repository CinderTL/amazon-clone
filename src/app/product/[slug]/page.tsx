import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/services/catalog";
import { isPlaceholderImageUrl, parseImages } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ProductImage } from "@/components/ProductImage";
import { ProductGrid } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Price } from "@/components/CurrencyProvider";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { ProductViewTracker } from "@/components/ProductViewTracker";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { hasPurchasedProduct, ratingDistribution } from "@/services/reviews";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active || product.status !== "PUBLISHED") notFound();

  const images = parseImages(product.images).filter((src) => !isPlaceholderImageUrl(src));
  const cover = product.imageUrl && !isPlaceholderImageUrl(product.imageUrl) ? product.imageUrl : null;
  const gallery = images.length ? images : cover ? [cover] : [];
  const related = product.categoryId
    ? await prisma.product.findMany({
        where: { active: true, status: "PUBLISHED", categoryId: product.categoryId, id: { not: product.id } },
        take: 8,
        include: { category: true, seller: true },
      })
    : [];

  const user = await getCurrentUser();
  const canReview = user ? await hasPurchasedProduct(user.id, product.id) : false;
  const distribution = await ratingDistribution(product.id);

  const shipping =
    product.shippingScope === "NATIONAL" && product.originCountry
      ? `Ships nationally from ${product.originCountry}`
      : "Ships internationally";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {user && <ProductViewTracker productId={product.id} />}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lx-card p-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--elevated)]">
            <ProductImage
              src={gallery[0]}
              alt={product.name}
              className="absolute inset-0 p-8"
              imageClassName="object-contain"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.slice(0, 8).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--elevated)]">
                  <ProductImage src={src} alt="" className="absolute inset-0 p-2" imageClassName="object-contain" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">
            {product.category && (
              <Link href={`/category/${product.category.slug}`} className="text-[var(--signal)]">
                {product.category.name}
              </Link>
            )}
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              <Price amount={product.price} />
            </span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-[var(--muted)] line-through">
                <Price amount={product.compareAt} />
              </span>
            )}
          </div>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{product.description}</p>
          <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? "text-[var(--foreground)]" : "text-[var(--signal)]"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">Sold by {product.seller.storeName}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{shipping}</p>
          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                stock: variant.stock,
                priceDelta: variant.priceDelta,
              }))}
              disabled={product.stock < 1}
            />
          </div>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        storeName={product.seller.storeName}
        average={product.rating}
        count={distribution.total}
        distribution={distribution.counts}
        canReview={canReview}
        signedIn={Boolean(user)}
        currentUserId={user?.id ?? null}
        reviews={product.reviews.map((review) => ({
          id: review.id,
          userId: review.userId,
          rating: review.rating,
          title: review.title,
          body: review.body,
          createdAt: review.createdAt.toISOString(),
          updatedAt: review.updatedAt.toISOString(),
          sellerResponse: review.sellerResponse,
          sellerRespondedAt: review.sellerRespondedAt?.toISOString() ?? null,
          user: review.user,
        }))}
      />

      <section className="mt-12">
        <h2 className="mb-4 font-heading text-2xl font-bold">Related products</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
