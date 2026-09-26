import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function deleteSellerCategories(tx: Pick<PrismaClient, "category">) {
  let removed = 0;
  for (;;) {
    const batch = await tx.category.findMany({
      where: { sellerId: { not: null }, children: { none: {} } },
      select: { id: true },
    });
    if (!batch.length) break;
    await tx.category.deleteMany({ where: { id: { in: batch.map((category) => category.id) } } });
    removed += batch.length;
  }

  const remaining = await tx.category.count({ where: { sellerId: { not: null } } });
  if (remaining > 0) {
    throw new Error("Some seller categories could not be removed because other rows still reference them.");
  }
  return removed;
}

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error("This deletes users, stores, seller categories, products, carts, wishlists, orders, and reviews.");
    console.error("Website categories stay in place.");
    console.error("Run: npm run db:clean -- --yes");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env before cleaning.");
  }

  const [users, sellers, sellerCategories, products, orders, reviews, websiteCategories] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.category.count({ where: { sellerId: { not: null } } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.category.count({ where: { sellerId: null } }),
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany();
    await tx.order.deleteMany();
    await tx.product.deleteMany();
    await deleteSellerCategories(tx);
    await tx.user.deleteMany();
  });

  console.log("Database cleaned. Website categories were left in place.");
  console.log(
    `Removed ${users} users, ${sellers} stores, ${sellerCategories} seller categories, ${products} products, ${orders} orders, ${reviews} reviews.`,
  );
  console.log(`Kept ${websiteCategories} website categories.`);
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
