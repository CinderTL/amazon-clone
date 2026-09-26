import { requireSeller } from "@/lib/auth";
import { listSellerOrders } from "@/services/seller";
import { SellerShell } from "@/components/SellerNav";
import { SellerOrdersList } from "@/components/SellerForms";

export const metadata = { title: "Seller Orders" };

export default async function SellerOrdersPage() {
  const { seller } = await requireSeller();
  const orders = await listSellerOrders(seller.id);

  return (
    <SellerShell current="/seller/orders" title="Orders">
      <SellerOrdersList orders={orders} />
    </SellerShell>
  );
}
