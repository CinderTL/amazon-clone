import fs from "fs/promises";
import path from "path";
import { ApiError } from "@/lib/api";
import { isProductImageSource, isRemoteImageUrl, isStoreImageSource, isStoreUploadPath, isUploadPath } from "@/lib/upload-path";

export type UploadScope = "products" | "stores";

export function uploadsDirectory(scope: UploadScope = "products") {
  return path.join(process.cwd(), "public", "uploads", scope);
}

async function assertLocalFile(root: string, filename: string, missingMessage: string) {
  const full = path.resolve(root, filename);
  if (!full.startsWith(root + path.sep)) throw new ApiError("Invalid image");
  try {
    await fs.access(full);
  } catch {
    throw new ApiError(missingMessage);
  }
}

export async function assertProductImages(images: string[]) {
  const root = path.resolve(uploadsDirectory("products"));
  for (const image of images) {
    if (!isProductImageSource(image)) {
      throw new ApiError("Each product image must be an uploaded file or an image link");
    }
    if (isRemoteImageUrl(image)) continue;
    if (!isUploadPath(image)) throw new ApiError("Each product image must be an uploaded file or an image link");
    await assertLocalFile(root, path.basename(image), "One of the product images could not be found. Upload it again.");
  }
}

export async function assertStoreImage(image: string | null | undefined) {
  if (!image) return;
  if (!isStoreImageSource(image)) {
    throw new ApiError("Use an uploaded image or an image link that starts with http:// or https://");
  }
  if (isRemoteImageUrl(image)) return;
  if (!isStoreUploadPath(image)) {
    throw new ApiError("Use an uploaded image or an image link that starts with http:// or https://");
  }
  await assertLocalFile(
    path.resolve(uploadsDirectory("stores")),
    path.basename(image),
    "That store image could not be found. Upload it again."
  );
}
