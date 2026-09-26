import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const TABLES = [
  "ProductView",
  "Review",
  "OrderItem",
  "Order",
  "WishlistItem",
  "Wishlist",
  "CartItem",
  "Cart",
  "Address",
  "ProductVariant",
  "Product",
  "Category",
  "SellerProfile",
  "User",
] as const;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

async function main() {
  if (!process.argv.includes("--yes")) {
    console.error("This deletes every user, store, product, order, and category row.");
    console.error("The schema and migration history stay in place.");
    console.error("Run: npm run db:clean -- --yes");
    console.error("Then restore the marketplace categories with: npm run db:seed");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env before cleaning.");
  }

  const [users, sellers, categories, products, orders, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.review.count(),
  ]);

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(", ")} RESTART IDENTITY CASCADE`);

  console.log("Database cleaned.");
  console.log(
    `Removed ${users} users, ${sellers} stores, ${categories} categories, ${products} products, ${orders} orders, ${reviews} reviews.`
  );
  console.log("Run npm run db:seed to restore the marketplace categories.");
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
