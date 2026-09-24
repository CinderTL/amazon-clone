import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { ProductForm } from "@/components/SellerForms";

export const metadata = { title: "New Product" };

export default async function NewProductPage() {
  await requireSeller();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <SellerShell current="/seller/products" title="Add product">
      <ProductForm categories={categories} />
    </SellerShell>
  );
}
