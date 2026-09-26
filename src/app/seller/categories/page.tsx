import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { CategoryManager } from "@/components/seller/CategoryManager";
import { listSellerCategories } from "@/services/store-categories";

export const metadata = { title: "Store categories" };

export default async function SellerCategoriesPage() {
  const { seller } = await requireSeller();
  const categories = await listSellerCategories(seller.id);

  return (
    <SellerShell current="/seller/categories" title="Categories">
      <CategoryManager
        storeSlug={seller.slug}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          imageUrl: category.imageUrl,
          productCount: category._count.products,
        }))}
      />
    </SellerShell>
  );
}
