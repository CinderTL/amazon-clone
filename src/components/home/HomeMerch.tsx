import { getSession } from "@/lib/auth";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { ForYouFeed } from "@/components/home/ForYouFeed";
import { homepageMerch } from "@/services/recommendations";

export async function HomeMerch() {
  const session = await getSession();
  const { flashSale, forYou } = await homepageMerch(session?.userId ?? null, 12);
  return (
    <>
      <FlashSaleSection products={flashSale} />
      <ForYouFeed initialItems={forYou.items} initialTotal={forYou.total} pageSize={forYou.pageSize} />
    </>
  );
}
