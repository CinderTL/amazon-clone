import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORY_CATALOG } from "../src/lib/category-catalog";
import { isPlaceholderImage } from "./mock-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function upsertMarketplaceCategory(input: {
  name: string;
  slug: string;
  description?: string | null;
  accent: string;
  sortOrder: number;
  parentId: string | null;
}) {
  const existing = await prisma.category.findUnique({ where: { slug: input.slug } });
  if (existing?.sellerId) {
    console.warn(`Skipped ${input.slug}: a store already owns that slug.`);
    return null;
  }

  const imageUrl = existing && isPlaceholderImage(existing.imageUrl) ? null : existing?.imageUrl ?? null;
  const data = {
    name: input.name,
    description: input.description ?? null,
    accent: input.accent,
    sortOrder: input.sortOrder,
    parentId: input.parentId,
    sellerId: null,
    imageUrl,
  };

  if (existing) {
    return prisma.category.update({ where: { id: existing.id }, data });
  }

  return prisma.category.create({
    data: {
      ...data,
      slug: input.slug,
    },
  });
}

async function syncCategories() {
  let departments = 0;
  let subcategories = 0;

  for (const [index, parent] of CATEGORY_CATALOG.entries()) {
    const row = await upsertMarketplaceCategory({
      name: parent.name,
      slug: parent.slug,
      description: parent.description,
      accent: parent.accent,
      sortOrder: index,
      parentId: null,
    });
    if (!row) continue;
    departments += 1;

    for (const [childIndex, child] of parent.children.entries()) {
      const childRow = await upsertMarketplaceCategory({
        name: child.name,
        slug: child.slug,
        accent: parent.accent,
        sortOrder: childIndex,
        parentId: row.id,
      });
      if (childRow) subcategories += 1;
    }
  }

  return { departments, subcategories };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env before creating categories.");
  }

  const result = await syncCategories();
  console.log(`Marketplace categories ready: ${result.departments} departments, ${result.subcategories} subcategories.`);
  console.log("Existing accounts, stores, products, and orders were left in place.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
