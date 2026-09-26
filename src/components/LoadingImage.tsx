"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
  fallback?: React.ReactNode;
};

function ImageFallback({ alt, children }: { alt: string; children?: React.ReactNode }) {
  if (children) return <>{children}</>;
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--canvas)] text-[var(--muted)]"
      role="img"
      aria-label={alt || "Image unavailable"}
    >
      <ImageOff className="h-8 w-8" aria-hidden />
      <span className="text-[11px] font-medium uppercase tracking-wide">Image unavailable</span>
    </div>
  );
}

function LoadingImageInner({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 50vw, 20vw",
  priority = false,
  fit = "cover",
  fallback,
}: LoadingImageProps & { src: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div className={cn("relative overflow-hidden bg-[var(--canvas)]", className)}>
      {status === "loading" && <div className="shimmer absolute inset-0 z-[1]" aria-hidden />}
      {status === "error" ? (
        <ImageFallback alt={alt}>{fallback}</ImageFallback>
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
            fit === "contain" ? "object-contain" : "object-cover",
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

export function LoadingImage(props: LoadingImageProps) {
  const trimmed = props.src?.trim();
  if (!trimmed) {
    return (
      <div className={cn("relative overflow-hidden bg-[var(--canvas)]", props.className)}>
        <ImageFallback alt={props.alt}>{props.fallback}</ImageFallback>
      </div>
    );
  }

  return <LoadingImageInner key={trimmed} {...props} src={trimmed} />;
}
