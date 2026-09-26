import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <h1 className="font-heading text-4xl font-extrabold">Page not found</h1>
      <p className="text-[var(--muted)] mt-3 mb-6">We couldn&apos;t find that page on Lixazon.</p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
