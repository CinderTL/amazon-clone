import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getOrCreateWishlist } from "@/services/wishlist";
import { ProductGrid } from "@/components/ProductCard";
import { WishlistRemoveButton } from "@/components/WishlistRemoveButton";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await requireAuth();
  const wishlist = await getOrCreateWishlist(session.userId);
  const products = wishlist.items.map((i) => i.product);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-heading text-3xl font-extrabold">Wishlist</h1>
        <Link href="/account" className="text-sm text-[var(--signal)]">
          Back to account
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="lx-card p-10 text-center text-[var(--muted)]">No saved products yet.</div>
      ) : (
        <div className="space-y-4">
          <ProductGrid products={products} />
          <div className="flex flex-wrap gap-2">
            {wishlist.items.map((item) => (
              <WishlistRemoveButton key={item.id} productId={item.productId} name={item.product.name} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
