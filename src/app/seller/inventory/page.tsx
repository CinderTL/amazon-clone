import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { InventoryList } from "@/components/SellerForms";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const { seller } = await requireSeller();
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, stock: true, imageUrl: true },
  });

  return (
    <SellerShell current="/seller/inventory" title="Inventory">
      <p className="text-sm text-mh-muted mb-3">Update stock levels — changes save when you leave the field.</p>
      <InventoryList products={products} />
    </SellerShell>
  );
}
