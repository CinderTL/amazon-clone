import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";

export function PopularCategoryStrips({
  categories,
}: {
  categories: { name: string; slug: string; imageUrl: string | null; accent: string }[];
}) {
  return (
    <section className="grid w-full grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="lx-focus group relative flex min-h-[220px] flex-col justify-end overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-5 hover:bg-[var(--elevated)] md:min-h-[280px] md:p-6 xl:min-h-[320px]"
        >
          {cat.imageUrl && (
            <ProductImage
              src={cat.imageUrl}
              alt=""
              className="absolute inset-0"
              imageClassName="opacity-25 transition-opacity duration-300 group-hover:opacity-35"
              sizes="(max-width: 768px) 50vw, 16vw"
            />
          )}
          <div className="relative z-10">
            <h2 className="font-heading text-2xl font-extrabold leading-tight text-[var(--foreground)] md:text-3xl">
              {cat.name}
            </h2>
            <span className="mt-3 inline-flex translate-y-2 rounded bg-[var(--signal)] px-4 py-2 text-sm font-semibold text-[var(--canvas)] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              Browse {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
