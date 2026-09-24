import Link from "next/link";
import type { Product, Category, SellerProfile } from "@prisma/client";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { ProductImage } from "@/components/ProductImage";

type ProductWithRelations = Product & {
  category?: Category;
  seller?: SellerProfile;
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-white border border-mh-border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full w-full min-w-0"
    >
      <div className="relative aspect-square">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0"
          imageClassName="group-hover:scale-[1.02] transition-transform"
          sizes="(max-width:768px) 50vw, 20vw"
        />
        {product.compareAt && product.compareAt > product.price && (
          <span className="absolute top-2 left-2 z-10 bg-mh-danger text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">
            Deal
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <h3 className="text-sm text-mh-text line-clamp-2 group-hover:text-mh-link-hover leading-snug">
          {product.name}
        </h3>
        <StarRating rating={product.rating} count={product.reviewCount} />
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-medium">{formatPrice(product.price)}</span>
            {product.compareAt && product.compareAt > product.price && (
              <span className="text-xs text-mh-muted line-through">{formatPrice(product.compareAt)}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <p className="text-xs text-mh-stock mt-0.5">In Stock</p>
          ) : (
            <p className="text-xs text-mh-danger mt-0.5">Out of Stock</p>
          )}
          {product.seller && (
            <p className="text-xs text-mh-muted mt-0.5">Sold by {product.seller.storeName}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductWithRelations[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white border border-mh-border rounded-lg p-10 text-center text-mh-muted w-full">
        No products found. Try adjusting your filters.
      </div>
    );
  }
  return (
    <div className="w-full grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
