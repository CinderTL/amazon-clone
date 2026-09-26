import { handleApiError, jsonOk } from "@/lib/api";
import { listProducts } from "@/services/catalog";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await listProducts({
      q: searchParams.get("q") || undefined,
      category: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      rating: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
      inStock: searchParams.get("inStock") === "true",
      featured: searchParams.get("featured") === "true",
      sort: searchParams.get("sort") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 24,
    });
    return jsonOk(data);
  } catch (error) {
    return handleApiError(error);
  }
}
