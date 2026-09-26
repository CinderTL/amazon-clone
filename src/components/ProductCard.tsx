import Link from "next/link";
import type { Product, Category, SellerProfile } from "@/generated/prisma/client";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/Badge";

type ProductWithRelations = Product & {
  category?: Category | null;
  seller?: Pick<SellerProfile, "storeName" | "slug"> | SellerProfile | null;
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : null;

  return (
    <Link href={`/product/${product.slug}`} className="group lx-card flex flex-col overflow-hidden h-full w-full min-w-0">
      <div className="relative aspect-square bg-[var(--elevated)]">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 p-4"
          imageClassName="group-hover:scale-[1.03] transition-transform duration-200 object-contain"
          sizes="(max-width:768px) 50vw, 20vw"
        />
        {discount != null && (
          <span className="absolute top-3 left-3 z-10">
            <Badge>-{discount}%</Badge>
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-2 leading-snug">{product.name}</h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="mt-auto pt-1 flex items-baseline gap-2">
          <span className="text-base font-bold">{formatPrice(product.price)}</span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-xs text-[var(--muted)] line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
        <p className={`text-[11px] ${product.stock > 0 ? "text-[var(--foreground)]" : "text-[var(--signal)]"}`}>
          {product.stock > 0 ? "In stock" : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <div className="lx-card p-10 text-center text-[var(--muted)] w-full">
        No products found. Try adjusting your filters.
      </div>
    );
  }
  return (
    <div className="w-full grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
