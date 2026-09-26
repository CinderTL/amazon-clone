import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/services/catalog";
import { formatPrice, parseImages } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ProductImage } from "@/components/ProductImage";
import { ProductGrid } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ReviewForm } from "@/components/ReviewForm";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const images = parseImages(product.images);
  const gallery = images.length ? images : [product.imageUrl];
  const related = await prisma.product.findMany({
    where: { active: true, categoryId: product.categoryId, id: { not: product.id } },
    take: 8,
    include: { category: true, seller: true },
  });

  const session = await getSession();
  let canReview = false;
  if (session) {
    const purchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: { userId: session.userId, paymentStatus: "SUCCEEDED" },
      },
    });
    canReview = Boolean(purchased);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="lx-card p-4">
          <div className="aspect-square rounded-2xl bg-[var(--elevated)] relative overflow-hidden">
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
              {gallery.slice(0, 4).map((src) => (
                <div key={src} className="aspect-square rounded-xl overflow-hidden relative bg-[var(--elevated)]">
                  <ProductImage src={src} alt="" className="absolute inset-0 p-2" imageClassName="object-contain" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">
            <Link href={`/category/${product.category.slug}`} className="text-[var(--signal)]">
              {product.category.name}
            </Link>
            {product.brand ? ` · ${product.brand}` : ""}
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-extrabold mt-2">{product.name}</h1>
          <div className="mt-3">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-[var(--muted)] line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>
          <p className="mt-4 text-[var(--muted)] leading-relaxed">{product.description}</p>
          <p className={`mt-3 text-sm font-medium ${product.stock > 0 ? "text-[var(--foreground)]" : "text-[var(--signal)]"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
          <p className="text-sm text-[var(--muted)] mt-1">Sold by {product.seller.storeName}</p>
          <div className="mt-6">
            <AddToCartButton
              productId={product.id}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                stock: v.stock,
                priceDelta: v.priceDelta,
              }))}
              disabled={product.stock < 1}
            />
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold mb-4">Reviews</h2>
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-3">
            {product.reviews.length === 0 && (
              <div className="lx-card p-6 text-[var(--muted)]">No reviews yet.</div>
            )}
            {product.reviews.map((r) => (
              <div key={r.id} className="lx-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.user.name}</p>
                  <StarRating rating={r.rating} />
                </div>
                {r.title && <p className="font-semibold mt-1">{r.title}</p>}
                {r.body && <p className="text-sm text-[var(--muted)] mt-1">{r.body}</p>}
              </div>
            ))}
          </div>
          <div>
            {canReview ? (
              <ReviewForm productId={product.id} />
            ) : (
              <div className="lx-card p-4 text-sm text-[var(--muted)]">
                Purchase this product to leave a review.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-2xl font-bold mb-4">Related products</h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
