import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatPrice, parseImages } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductGrid } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      seller: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!product || !product.active) notFound();

  const images = parseImages(product.images);
  const gallery = images.length > 0 ? images : [product.imageUrl];

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, id: { not: product.id } },
    include: { seller: true, category: true },
    take: 5,
  });

  return (
    <div className="w-full px-3 md:px-4 py-4">
      <nav className="text-xs text-mh-muted mb-4">
        <Link href="/" className="text-mh-link hover:underline">
          Home
        </Link>
        {" › "}
        <Link href={`/category/${product.category.slug}`} className="text-mh-link hover:underline">
          {product.category.name}
        </Link>
        {" › "}
        <span className="line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-mh-border rounded-lg p-4 md:p-6">
        <div className="md:col-span-5">
          <ProductImage
            src={gallery[0]}
            alt={product.name}
            className="aspect-square rounded-lg"
            priority
            sizes="(max-width:768px) 100vw, 40vw"
          />
          {gallery.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {gallery.map((src, i) => (
                <ProductImage
                  key={i}
                  src={src}
                  alt=""
                  className="relative w-16 h-16 shrink-0 border border-mh-border rounded"
                  sizes="64px"
                />
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-4 space-y-3">
          <h1 className="text-xl md:text-2xl font-normal leading-snug">{product.name}</h1>
          {product.brand && <p className="text-sm text-mh-link">Brand: {product.brand}</p>}
          <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          <hr className="border-mh-border" />
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-mh-muted">Price:</span>
            <span className="text-2xl font-medium">{formatPrice(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-sm text-mh-muted line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-mh-text whitespace-pre-line">{product.description}</p>
          <p className="text-sm text-mh-muted">
            Sold by{" "}
            <span className="text-mh-link">{product.seller.storeName}</span> and fulfilled by Lixazon.
          </p>
        </div>

        <div className="md:col-span-3">
          <div className="border border-mh-border rounded-lg p-4 space-y-3 sticky top-24">
            <p className="text-2xl font-medium">{formatPrice(product.price)}</p>
            <p className="text-sm">
              {product.price >= 35 ? (
                <span className="text-mh-stock font-medium">FREE delivery</span>
              ) : (
                <span>
                  Delivery fee applies · FREE over $35
                </span>
              )}
            </p>
            {product.stock > 0 ? (
              <p className="text-lg text-mh-stock font-medium">
                In Stock{product.stock <= 10 ? ` — only ${product.stock} left` : ""}
              </p>
            ) : (
              <p className="text-lg text-mh-danger font-medium">Out of Stock</p>
            )}
            <AddToCartButton productId={product.id} stock={product.stock} />
            <AddToCartButton productId={product.id} stock={product.stock} variant="buy" />
          </div>
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section className="mt-6 bg-white border border-mh-border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">Customer reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((r) => (
              <div key={r.id} className="border-b border-mh-border pb-4 last:border-0">
                <p className="font-medium text-sm">{r.user.name}</p>
                <StarRating rating={r.rating} />
                {r.title && <p className="font-medium mt-1">{r.title}</p>}
                {r.body && <p className="text-sm text-mh-muted mt-1">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">Related products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
