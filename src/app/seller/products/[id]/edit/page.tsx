import { notFound } from "next/navigation";
import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { ProductEditor } from "@/components/seller/ProductEditor";
import { listSellerCategories } from "@/services/store-categories";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: Props) {
  const { seller } = await requireSeller();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({ where: { id, sellerId: seller.id } }),
    listSellerCategories(seller.id),
  ]);
  if (!product) notFound();

  return (
    <SellerShell current="/seller/products" title={product.status === "DRAFT" ? "Edit draft" : "Edit product"}>
      <ProductEditor
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
        originCountry={seller.originCountry}
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAt: product.compareAt,
          stock: product.stock,
          categoryId: product.categoryId,
          brand: product.brand,
          imageUrl: product.imageUrl,
          images: product.images,
          featured: product.featured,
          shippingScope: product.shippingScope,
          status: product.status,
        }}
      />
    </SellerShell>
  );
}
