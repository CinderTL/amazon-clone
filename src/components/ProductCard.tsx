import Link from "next/link";
import { cn } from "@/lib/utils";
import { Price } from "@/components/CurrencyProvider";
import { StarRating } from "@/components/ui/StarRating";
import { ProductImage } from "@/components/ProductImage";
import { Badge } from "@/components/ui/Badge";

export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAt: number | null;
  stock: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  seller?: { storeName: string; slug: string } | null;
};

export function ProductCard({ product }: { product: CardProduct }) {
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
          sizes="(max-width:640px) 50vw, (max-width:1280px) 25vw, 16vw"
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
          <span className="text-base font-bold">
            <Price amount={product.price} />
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="text-xs text-[var(--muted)] line-through">
              <Price amount={product.compareAt} />
            </span>
          )}
        </div>
        <p className={`text-[11px] ${product.stock > 0 ? "text-[var(--foreground)]" : "text-[var(--signal)]"}`}>
          {product.stock > 0 ? "In stock" : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}

const gridLayout = {
  default: "grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  home: "grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-6",
};

export function ProductGrid({
  products,
  empty = "No products found. Try adjusting your filters.",
  variant = "default",
}: {
  products: CardProduct[];
  empty?: string;
  variant?: keyof typeof gridLayout;
}) {
  if (products.length === 0) {
    return (
      <div className="lx-card p-10 text-center text-[var(--muted)] w-full">
        {empty}
      </div>
    );
  }
  return (
    <div className={cn("grid w-full", gridLayout[variant])}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
