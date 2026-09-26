"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function WishlistRemoveButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={async () => {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        router.refresh();
      }}
    >
      Remove {name.slice(0, 18)}
    </Button>
  );
}
