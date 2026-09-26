import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";

const ACCENT: Record<string, string> = {
  coral: "var(--coral)",
  sky: "var(--sky)",
  mint: "var(--mint)",
  mustard: "var(--mustard)",
};

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
          className="lx-focus group relative flex min-h-[220px] flex-col justify-end overflow-hidden p-5 md:min-h-[280px] md:p-6 xl:min-h-[320px]"
          style={{ backgroundColor: ACCENT[cat.accent] ?? "var(--sky)" }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-heading text-2xl font-extrabold leading-tight text-white drop-shadow-sm md:text-3xl">
              {cat.name}
            </h2>
            <span className="mt-3 inline-flex translate-y-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--text)] opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              Browse {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
