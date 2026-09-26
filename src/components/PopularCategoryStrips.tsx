import Link from "next/link";
import { POPULAR_CATEGORIES } from "@/lib/nav-categories";

export function PopularCategoryStrips() {
  return (
    <section className="w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {POPULAR_CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="group relative min-h-[220px] md:min-h-[280px] xl:min-h-[320px] overflow-hidden flex flex-col justify-end p-5 md:p-6"
          style={{ backgroundColor: cat.color }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cat.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
              {cat.name}
            </h2>
            <span className="mt-3 inline-flex opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 lx-pill bg-white text-[var(--text)] text-sm font-semibold px-4 py-2">
              Browse {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
