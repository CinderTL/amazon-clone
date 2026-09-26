import { ApiError } from "@/lib/api";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { assertStoreImage } from "@/lib/uploads";

export type StoreCategoryInput = {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
};

async function uniqueCategorySlug(sellerSlug: string, name: string) {
  const base = slugify(`${sellerSlug}-${name}`) || `${sellerSlug}-category`;
  let slug = base;
  let suffix = 2;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function listSellerCategories(sellerId: string) {
  return prisma.category.findMany({
    where: { sellerId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function createStoreCategory(sellerId: string, input: StoreCategoryInput) {
  const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
  if (!seller) throw new Error("FORBIDDEN");
  const imageUrl = input.imageUrl?.trim() || null;
  await assertStoreImage(imageUrl);
  const slug = await uniqueCategorySlug(seller.slug, input.name);
  const last = await prisma.category.aggregate({ where: { sellerId }, _max: { sortOrder: true } });
  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      imageUrl,
      sellerId,
      sortOrder: (last._max.sortOrder ?? 0) + 1,
    },
  });
}

export async function updateStoreCategory(sellerId: string, categoryId: string, input: StoreCategoryInput) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, sellerId } });
  if (!category) throw new Error("NOT_FOUND");
  const imageUrl = input.imageUrl?.trim() || null;
  await assertStoreImage(imageUrl);
  return prisma.category.update({
    where: { id: category.id },
    data: {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      imageUrl,
    },
  });
}

export async function deleteStoreCategory(sellerId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, sellerId } });
  if (!category) throw new Error("NOT_FOUND");
  const used = await prisma.product.count({ where: { categoryId, sellerId } });
  if (used > 0) throw new ApiError("Move products out of this category before deleting it");
  await prisma.category.delete({ where: { id: category.id } });
  return { ok: true };
}
