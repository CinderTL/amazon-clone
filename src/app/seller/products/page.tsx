import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { ProductTable } from "@/components/SellerForms";

export const metadata = { title: "Seller Products" };

export default async function SellerProductsPage() {
  const { seller } = await requireSeller();
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <SellerShell current="/seller/products" title="Products">
      <ProductTable products={products} />
    </SellerShell>
  );
}
