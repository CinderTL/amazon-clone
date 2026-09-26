import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { uploadsDirectory } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "gif"]);

export async function POST(request: Request) {
  try {
    await requireApiSeller();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("Choose an image to upload");
    if (file.size < 1) throw new ApiError("That file is empty");
    if (file.size > MAX_BYTES) throw new ApiError("Each image must be 5 MB or smaller");

    const buffer = Buffer.from(await file.arrayBuffer());
    let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
    try {
      metadata = await sharp(buffer, { failOn: "error" }).metadata();
    } catch {
      throw new ApiError("Upload a JPEG, PNG, WebP, or GIF image");
    }
    if (!metadata.format || !ALLOWED.has(metadata.format)) {
      throw new ApiError("Upload a JPEG, PNG, WebP, or GIF image");
    }

    const output = await sharp(buffer, { failOn: "error" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const filename = `${randomBytes(16).toString("hex")}.webp`;
    const directory = uploadsDirectory();
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), output);
    return jsonOk({ url: `/uploads/products/${filename}` }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
