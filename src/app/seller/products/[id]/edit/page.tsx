import { notFound } from "next/navigation";
import { requireSeller } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SellerShell } from "@/components/SellerNav";
import { ProductForm } from "@/components/SellerForms";

type Props = { params: Promise<{ id: string }> };

export const metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: Props) {
  const { seller } = await requireSeller();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({ where: { id, sellerId: seller.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <SellerShell current="/seller/products" title="Edit product">
      <ProductForm categories={categories} product={product} />
    </SellerShell>
  );
}
