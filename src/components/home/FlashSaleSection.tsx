import { ProductGrid, type CardProduct } from "@/components/ProductCard";

export function FlashSaleSection({ products }: { products: CardProduct[] }) {
  return (
    <section className="w-full px-4 py-8 md:px-8 md:py-10 lg:px-12" aria-labelledby="flash-sale-heading">
      <h2 id="flash-sale-heading" className="mb-4 font-heading text-2xl font-extrabold md:text-3xl">
        Flash Sale
      </h2>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No discounted products qualify for Flash Sale right now.</p>
      ) : (
        <ProductGrid products={products} variant="home" />
      )}
    </section>
  );
}
