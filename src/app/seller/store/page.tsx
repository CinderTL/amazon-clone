import { requireSeller } from "@/lib/auth";
import { SellerShell } from "@/components/SellerNav";
import { StoreProfileForm } from "@/components/seller/StoreProfileForm";

export const metadata = { title: "Store Profile" };

export default async function StorePage() {
  const { seller } = await requireSeller();

  return (
    <SellerShell current="/seller/store" title="Store profile">
      <StoreProfileForm store={seller} />
    </SellerShell>
  );
}
