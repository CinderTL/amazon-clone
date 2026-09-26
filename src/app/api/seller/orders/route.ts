import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { handleApiError, jsonOk, readJson } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser, listSellerOrders, updateSellerOrderStatus } from "@/services/seller";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const orders = await listSellerOrders(seller.id);
    return jsonOk({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const body = schema.parse(await readJson(request));
    const order = await updateSellerOrderStatus(seller.id, body.orderId, body.status);
    return jsonOk({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
