"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function NoImageArt({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#f3f4f4] to-[#e8eaea] text-mh-muted",
        className
      )}
      role="img"
      aria-label="No image available"
    >
      <svg
        viewBox="0 0 120 120"
        className="w-[42%] max-w-[120px] h-auto opacity-90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect x="18" y="28" width="84" height="64" rx="8" fill="#d5d9d9" />
        <rect x="24" y="34" width="72" height="52" rx="5" fill="#fff" />
        <circle cx="46" cy="52" r="10" fill="#c8cccc" />
        <path d="M28 78l22-20 14 12 10-8 18 16H28z" fill="#c8cccc" />
        <path
          d="M78 22l4.2 8.8L91 35l-8.8 4.2L78 48l-4.2-8.8L65 35l8.8-4.2L78 22z"
          fill="#ff9900"
        />
        <path
          d="M38 88h44M50 94h20"
          stroke="#aab0b0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[11px] font-medium tracking-wide uppercase text-[#8a8f8f]">
        No image
      </span>
    </div>
  );
}

type ProductImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
};

function ProductImageInner({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  imageClassName,
  sizes = "(max-width:768px) 50vw, 20vw",
  priority = false,
}: ProductImageProps & { src: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className={cn("relative overflow-hidden bg-mh-soft", className)}>
      {status === "loading" && (
        <div className="absolute inset-0 shimmer z-[1]" aria-hidden />
      )}

      {status === "error" ? (
        <NoImageArt />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0",
            imageClassName
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}

export function ProductImage(props: ProductImageProps) {
  const trimmed = props.src?.trim();
  if (!trimmed) {
    return (
      <div className={cn("relative overflow-hidden bg-mh-soft", props.className)}>
        <NoImageArt />
      </div>
    );
  }

  return <ProductImageInner key={trimmed} {...props} src={trimmed} />;
}
