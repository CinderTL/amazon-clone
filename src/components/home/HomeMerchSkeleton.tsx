function Block({ title }: { title: string }) {
  return (
    <section className="w-full px-4 py-8 md:px-8 lg:px-12" aria-busy="true" aria-label={`Loading ${title}`}>
      <h2 className="mb-4 font-heading text-2xl font-extrabold md:text-3xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="shimmer aspect-[3/4] rounded-lg" />
        ))}
      </div>
    </section>
  );
}

export function HomeMerchSkeleton() {
  return (
    <div>
      <Block title="Flash Sale" />
      <Block title="For You" />
    </div>
  );
}
