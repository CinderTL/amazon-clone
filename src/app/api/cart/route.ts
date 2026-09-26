import { z } from "zod";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { addCartItem, cartTotals, getOrCreateCart, removeCartItem, updateCartItem } from "@/services/cart";

export async function GET() {
  try {
    const session = await requireApiSession();
    const cart = await getOrCreateCart(session.userId);
    return jsonOk({ cart, totals: cartTotals(cart.items) });
  } catch (error) {
    return handleApiError(error);
  }
}

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  variantId: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = addSchema.parse(await readJson(request));
    const cart = await addCartItem(session.userId, body.productId, body.quantity, body.variantId);
    return jsonOk({ cart, totals: cartTotals(cart.items) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

const patchSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    const body = patchSchema.parse(await readJson(request));
    const cart = await updateCartItem(session.userId, body.itemId, body.quantity);
    return jsonOk({ cart, totals: cartTotals(cart.items) });
  } catch (error) {
    return handleApiError(error);
  }
}

const deleteSchema = z.object({ itemId: z.string().min(1) });

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    const body = deleteSchema.parse(await readJson(request));
    const cart = await removeCartItem(session.userId, body.itemId);
    return jsonOk({ cart, totals: cartTotals(cart.items) });
  } catch (error) {
    return handleApiError(error);
  }
}
