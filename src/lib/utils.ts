import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function accountInitial(name: string, email?: string) {
  const source = name.trim() || email?.trim() || "";
  return source.charAt(0).toUpperCase() || "L";
}

export function hasThirdPartyAvatar(user: { authProvider: string; avatarUrl: string | null }) {
  return user.authProvider !== "credentials" && Boolean(user.avatarUrl?.trim());
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const PLACEHOLDER_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "picsum.photos",
  "fastly.picsum.photos",
  "placehold.co",
]);

export function isPlaceholderImageUrl(src: string) {
  try {
    return PLACEHOLDER_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
