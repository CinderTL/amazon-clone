import { handleApiError, jsonOk } from "@/lib/api";
import { listCategories } from "@/services/catalog";

export async function GET() {
  try {
    const categories = await listCategories();
    return jsonOk({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
