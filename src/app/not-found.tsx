import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-mh-muted mb-6">We couldn&apos;t find that page on Lixazon.</p>
      <Link
        href="/"
        className="inline-flex h-10 px-5 items-center rounded-full bg-gradient-to-b from-mh-cta-top to-mh-cta-bottom border border-mh-cta-border font-medium"
      >
        Go to homepage
      </Link>
    </div>
  );
}
