import { handleApiError, jsonOk } from "@/lib/api";
import { getApiSession } from "@/lib/session";
import { forYouPage } from "@/services/recommendations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || "1");
    const pageSize = Number(searchParams.get("pageSize") || "12");
    const session = await getApiSession();
    const data = await forYouPage(session?.userId ?? null, Number.isFinite(page) ? page : 1, Number.isFinite(pageSize) ? pageSize : 12);
    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}
