"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ProductImage";

export type DealSlide = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
};

export function DealCarousel({ deals }: { deals: DealSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = deals.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;

  const deal = deals[index];
  const discount =
    deal.compareAt && deal.compareAt > deal.price
      ? Math.round(((deal.compareAt - deal.price) / deal.compareAt) * 100)
      : null;

  return (
    <section className="w-full relative overflow-hidden bg-[var(--sky)] text-white">
      <div className="absolute inset-0 opacity-20">
        <ProductImage
          src={deal.imageUrl}
          alt=""
          className="absolute inset-0"
          imageClassName="object-cover scale-110 blur-sm"
          sizes="100vw"
        />
      </div>

      <div className="relative w-full px-4 md:px-8 lg:px-12 py-10 md:py-14 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center min-h-[340px] md:min-h-[400px]">
        <div>
          <p className="font-heading text-xs md:text-sm font-bold tracking-[0.2em] uppercase opacity-90">
            Deal of the Day · {deal.categoryName}
          </p>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold mt-3 leading-tight max-w-xl">
            {deal.name}
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/85 max-w-lg line-clamp-3">{deal.description}</p>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl md:text-4xl font-extrabold">{formatPrice(deal.price)}</span>
            {deal.compareAt && deal.compareAt > deal.price && (
              <span className="text-lg line-through text-white/60">{formatPrice(deal.compareAt)}</span>
            )}
            {discount != null && (
              <span className="lx-pill bg-white text-[var(--coral)] text-xs font-bold px-2.5 py-1">-{discount}%</span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/product/${deal.slug}`}>
              <Button size="lg" className="bg-white text-[var(--sky)] hover:bg-white/90">
                Shop this deal
              </Button>
            </Link>
            <Link href={`/category/${deal.categorySlug}`}>
              <Button size="lg" variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                More in {deal.categoryName}
              </Button>
            </Link>
          </div>
        </div>

        <Link href={`/product/${deal.slug}`} className="relative mx-auto w-full max-w-md aspect-square rounded-[28px] overflow-hidden bg-white/15 border border-white/20 shadow-2xl">
          <ProductImage
            src={deal.imageUrl}
            alt={deal.name}
            className="absolute inset-0 p-8"
            imageClassName="object-contain"
            sizes="(max-width:768px) 90vw, 420px"
          />
        </Link>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous deal"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next deal"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-black/25 hover:bg-black/40 flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {deals.map((d, i) => (
              <button
                key={d.id}
                type="button"
                aria-label={`Go to ${d.categoryName} deal`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2 bg-white/45"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
