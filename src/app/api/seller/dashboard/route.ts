import { handleApiError, jsonOk } from "@/lib/api";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser, sellerDashboard } from "@/services/seller";

export async function GET() {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const data = await sellerDashboard(seller.id);
    return jsonOk({ seller, ...data });
  } catch (error) {
    return handleApiError(error);
  }
}
