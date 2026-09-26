import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { ProductEditor } from "@/components/seller/ProductEditor";
import { listSellerCategories } from "@/services/store-categories";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const { seller } = await requireSeller();
  const categories = (await listSellerCategories(seller.id)).map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <SellerShell current="/seller/products" title="Add product">
      <ProductEditor categories={categories} originCountry={seller.originCountry} />
    </SellerShell>
  );
}
