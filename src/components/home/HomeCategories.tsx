import { cache } from "react";
import { CategoryCircles } from "@/components/home/CategoryCircles";
import { listCategories } from "@/services/catalog";

export const getHomeCategories = cache(async () => listCategories());

export async function HomeCategories() {
  const categories = await getHomeCategories();
  return (
    <CategoryCircles
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      }))}
    />
  );
}
