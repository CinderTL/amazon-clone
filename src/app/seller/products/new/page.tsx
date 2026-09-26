import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { ProductEditor } from "@/components/seller/ProductEditor";
import { listMarketplaceCategories } from "@/services/catalog";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  const { seller } = await requireSeller();
  const categories = await listMarketplaceCategories();

  return (
    <SellerShell current="/seller/products" title="Add product">
      <ProductEditor categories={categories} originCountry={seller.originCountry} />
    </SellerShell>
  );
}
