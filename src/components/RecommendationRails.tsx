import { ProductGrid } from "@/components/ProductCard";

type RailProduct = Parameters<typeof ProductGrid>[0]["products"][number];

export function RecommendationRails({
  rails,
}: {
  rails: { id: string; title: string; products: RailProduct[] }[];
}) {
  if (!rails.length) return null;
  return (
    <div className="w-full">
      {rails.map((rail) => (
        <section key={rail.id} className="w-full px-4 py-8 md:px-8 lg:px-12">
          <h2 className="mb-4 font-heading text-2xl font-extrabold">{rail.title}</h2>
          <ProductGrid products={rail.products} />
        </section>
      ))}
    </div>
  );
}
