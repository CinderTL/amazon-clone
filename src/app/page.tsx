import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/ProductCard";

export default async function HomePage() {
  const [categories, featured, deals, bestsellers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      include: { seller: true, category: true },
      take: 10,
      orderBy: { rating: "desc" },
    }),
    prisma.product.findMany({
      where: { active: true, compareAt: { not: null } },
      include: { seller: true, category: true },
      take: 10,
      orderBy: { price: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      include: { seller: true, category: true },
      take: 10,
      orderBy: { reviewCount: "desc" },
    }),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative bg-mh-navy">
        <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px] overflow-hidden">
          <Image
            src="https://picsum.photos/seed/lixazon-hero/1500/400"
            alt="Lixazon deals"
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-mh-page via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 text-white">
            <p className="text-mh-brand font-semibold text-sm tracking-wide uppercase mb-1">Lixazon</p>
            <h1 className="text-3xl md:text-4xl font-bold max-w-xl leading-tight">
              Everything you need, delivered
            </h1>
            <p className="mt-2 text-gray-200 max-w-md text-sm md:text-base">
              Shop electronics, home, fashion, and more from trusted sellers.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex w-fit bg-gradient-to-b from-mh-cta-top to-mh-cta-bottom text-mh-text font-medium px-5 py-2.5 rounded-full border border-mh-cta-border hover:brightness-95"
            >
              Shop all deals
            </Link>
          </div>
        </div>
      </section>

      <div className="w-full px-3 md:px-4 -mt-8 relative z-10 space-y-6 pb-10">
        {/* Category tiles */}
        <section className="bg-white border border-mh-border rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3">Shop by category</h2>
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group border border-mh-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-28 bg-mh-soft">
                  {c.imageUrl && (
                    <Image src={c.imageUrl} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="200px" />
                  )}
                </div>
                <div className="p-2 text-center font-medium text-sm">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold">Featured picks</h2>
            <Link href="/search?sort=rating" className="text-sm text-mh-link hover:underline">
              See more
            </Link>
          </div>
          <ProductGrid products={featured} />
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold">Today&apos;s deals</h2>
            <Link href="/search" className="text-sm text-mh-link hover:underline">
              See all deals
            </Link>
          </div>
          <ProductGrid products={deals} />
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl font-bold">Best sellers</h2>
            <Link href="/search?sort=rating" className="text-sm text-mh-link hover:underline">
              See more
            </Link>
          </div>
          <ProductGrid products={bestsellers} />
        </section>
      </div>
    </div>
  );
}
