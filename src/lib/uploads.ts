import fs from "fs/promises";
import path from "path";
import { ApiError } from "@/lib/api";
import { isUploadPath } from "@/lib/upload-path";

export function uploadsDirectory() {
  return path.join(process.cwd(), "public", "uploads", "products");
}

export async function assertStoredUploads(images: string[]) {
  const root = path.resolve(uploadsDirectory());
  for (const image of images) {
    if (!isUploadPath(image)) {
      throw new ApiError("Each product image must be uploaded through the product form");
    }
    const filename = path.basename(image);
    const full = path.resolve(root, filename);
    if (!full.startsWith(root + path.sep)) {
      throw new ApiError("Invalid product image");
    }
    try {
      await fs.access(full);
    } catch {
      throw new ApiError("One of the product images could not be found. Upload it again.");
    }
  }
}
