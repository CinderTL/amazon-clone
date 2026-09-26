import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORY_CATALOG } from "../src/lib/category-catalog";
import { isPlaceholderImage, MOCK_CATEGORY_SLUGS, MOCK_EMAILS, MOCK_PRODUCT_SLUGS, MOCK_STORE_SLUGS } from "./mock-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const catalogSlugs = new Set(
  CATEGORY_CATALOG.flatMap((category) => [category.slug, ...category.children.map((child) => child.slug)]),
);

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error("This removes only hardcoded mock accounts, stores, products, and unused legacy categories.");
    console.error("Real customers, sellers, store categories, products, and orders stay in the database.");
    console.error("Run: npm run db:clean -- --yes");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env before cleaning mock data.");
  }

  const users = await prisma.user.findMany({
    where: { email: { in: MOCK_EMAILS } },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);

  const sellers = await prisma.sellerProfile.findMany({
    where: {
      OR: [{ userId: { in: userIds } }, { slug: { in: MOCK_STORE_SLUGS } }],
    },
    select: { id: true, userId: true },
  });
  const sellerIds = sellers.map((seller) => seller.id);
  const sellerUserIds = [...new Set([...userIds, ...sellers.map((seller) => seller.userId)])];

  const products = await prisma.product.findMany({
    where: {
      OR: [{ slug: { in: MOCK_PRODUCT_SLUGS } }, { sellerId: { in: sellerIds } }],
    },
    select: { id: true },
  });
  const productIds = products.map((product) => product.id);

  const mockOrders = sellerUserIds.length
    ? await prisma.order.findMany({ where: { userId: { in: sellerUserIds } }, select: { id: true } })
    : [];

  const placeholderCategories = await prisma.category.findMany({
    where: { sellerId: null, imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
  });
  const placeholderCategoryIds = placeholderCategories
    .filter((category) => isPlaceholderImage(category.imageUrl))
    .map((category) => category.id);

  const legacyCategoryCount = await prisma.$transaction(async (tx) => {
    const orderItemFilters = [
      productIds.length ? { productId: { in: productIds } } : null,
      sellerIds.length ? { sellerId: { in: sellerIds } } : null,
      sellerUserIds.length ? { order: { userId: { in: sellerUserIds } } } : null,
    ].filter((filter) => filter !== null);

    if (orderItemFilters.length) {
      await tx.orderItem.deleteMany({ where: { OR: orderItemFilters } });
    }

    if (mockOrders.length) {
      await tx.order.deleteMany({ where: { id: { in: mockOrders.map((order) => order.id) } } });
    }

    if (productIds.length) {
      await tx.product.deleteMany({ where: { id: { in: productIds } } });
    }

    if (sellerIds.length) {
      await tx.sellerProfile.deleteMany({ where: { id: { in: sellerIds } } });
    }

    if (sellerUserIds.length) {
      await tx.user.deleteMany({ where: { id: { in: sellerUserIds } } });
    }

    const legacyCategories = await tx.category.findMany({
      where: {
        sellerId: null,
        slug: { in: MOCK_CATEGORY_SLUGS.filter((slug) => !catalogSlugs.has(slug)) },
        products: { none: {} },
        children: { none: {} },
      },
      select: { id: true },
    });
    if (legacyCategories.length) {
      await tx.category.deleteMany({ where: { id: { in: legacyCategories.map((category) => category.id) } } });
    }

    if (placeholderCategoryIds.length) {
      await tx.category.updateMany({
        where: { id: { in: placeholderCategoryIds } },
        data: { imageUrl: null },
      });
    }

    return legacyCategories.length;
  });

  console.log("Mock data removed. Real accounts and seller data were left in place.");
  console.log(
    `Removed ${sellerUserIds.length} mock users, ${sellerIds.length} mock stores, ${productIds.length} mock products, ${mockOrders.length} mock orders, ${legacyCategoryCount} unused legacy categories.`,
  );
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
