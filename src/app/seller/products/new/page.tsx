import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { ProductForm } from "@/components/SellerForms";
import { listCategoryOptions } from "@/services/catalog";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  await requireSeller();
  const categories = await listCategoryOptions();

  return (
    <SellerShell current="/seller/products" title="Add product">
      <ProductForm categories={categories} />
    </SellerShell>
  );
}
