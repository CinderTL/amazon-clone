import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import { ApiError, handleApiError, jsonOk } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { uploadsDirectory, type UploadScope } from "@/lib/uploads";

const MAX_BYTES = 5 * 1024 * 1024;

function imageExtension(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF87a") return "gif";
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF89a") return "gif";
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    await requireApiSeller();
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError("Choose an image to upload");
    if (file.size < 1) throw new ApiError("That file is empty");
    if (file.size > MAX_BYTES) throw new ApiError("Each image must be 5 MB or smaller");

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = imageExtension(buffer);
    if (!extension) throw new ApiError("Upload a JPEG, PNG, WebP, or GIF image");

    const filename = `${randomBytes(16).toString("hex")}.${extension}`;
    const directory = uploadsDirectory();
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), buffer);
    return jsonOk({ url: `/uploads/products/${filename}` }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
