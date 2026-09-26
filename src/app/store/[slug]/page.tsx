import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { getStorefront } from "@/services/storefront";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getStorefront(slug);
  return { title: data?.store.storeName ?? "Store" };
}

export default async function StorePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getStorefront(slug, query.category);
  if (!data || data.missingCategory) notFound();

  const { store, categories, products, activeCategory } = data;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      {store.bannerUrl && (
        <div className="relative mb-6 h-40 overflow-hidden rounded-2xl bg-[var(--elevated)] sm:h-56">
          <ProductImage src={store.bannerUrl} alt="" className="absolute inset-0" sizes="100vw" priority />
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--elevated)]">
          <ProductImage src={store.logoUrl} alt="" className="absolute inset-0" sizes="80px" fit="contain" />
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-3xl font-extrabold md:text-4xl">{store.storeName}</h1>
          {store.description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{store.description}</p>}
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold">Categories</h2>
        {categories.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">This store has not added categories yet.</p>
        ) : (
          <ul className="mt-3 flex gap-3 overflow-x-auto pb-1">
            <li>
              <Link
                href={`/store/${store.slug}`}
                className={`lx-focus block rounded-xl border px-4 py-3 text-sm font-semibold ${
                  activeCategory ? "border-[var(--border)]" : "border-[var(--signal)] text-[var(--signal)]"
                }`}
              >
                All products
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/store/${store.slug}?category=${category.slug}`}
                  className={`lx-focus flex w-44 items-center gap-3 rounded-xl border p-3 ${
                    activeCategory?.id === category.id ? "border-[var(--signal)]" : "border-[var(--border)]"
                  }`}
                >
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--elevated)]">
                    <ProductImage src={category.imageUrl} alt="" className="absolute inset-0" sizes="48px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{category.name}</span>
                    {category.description && <span className="line-clamp-2 text-xs text-[var(--muted)]">{category.description}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 font-heading text-xl font-bold">{activeCategory ? activeCategory.name : "Products"}</h2>
        <ProductGrid products={products} empty={activeCategory ? "No products in this category yet." : "No products in this store yet."} />
      </section>
    </div>
  );
}
