import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { addWishlistItem, getOrCreateWishlist, removeWishlistItem } from "@/services/wishlist";

export async function GET() {
  try {
    const session = await requireApiSession();
    const wishlist = await getOrCreateWishlist(session.userId);
    return jsonOk({ wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({ productId: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const wishlist = await addWishlistItem(session.userId, body.productId);
    return jsonOk({ wishlist }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    const wishlist = await removeWishlistItem(session.userId, body.productId);
    return jsonOk({ wishlist });
  } catch (error) {
    return handleApiError(error);
  }
}
