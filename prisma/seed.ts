import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORY_CATALOG } from "../src/lib/category-catalog";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const DEMO_EMAILS = ["customer@example.com", "ava@example.com", "seller@example.com"];

async function removeDemoAccounts() {
  const users = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);
  if (!userIds.length) return;

  const sellers = await prisma.sellerProfile.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const sellerIds = sellers.map((seller) => seller.id);

  await prisma.orderItem.deleteMany({
    where: {
      OR: [{ sellerId: { in: sellerIds } }, { order: { userId: { in: userIds } } }],
    },
  });
  await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.address.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}

async function removePlaceholderProducts() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { imageUrl: { contains: "picsum.photos" } },
        { imageUrl: { contains: "placehold.co" } },
        { imageUrl: { contains: "images.unsplash.com" } },
      ],
    },
    select: { id: true },
  });
  const ids = products.map((product) => product.id);
  if (!ids.length) return;
  await prisma.orderItem.deleteMany({ where: { productId: { in: ids } } });
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
}

async function syncCategories() {
  await prisma.category.updateMany({
    where: {
      OR: [
        { imageUrl: { contains: "picsum.photos" } },
        { imageUrl: { contains: "placehold.co" } },
        { imageUrl: { contains: "images.unsplash.com" } },
      ],
    },
    data: { imageUrl: null },
  });

  for (const [index, parent] of CATEGORY_CATALOG.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        accent: parent.accent,
        sortOrder: index,
        imageUrl: null,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        accent: parent.accent,
        sortOrder: index,
        imageUrl: null,
      },
    });

    for (const [childIndex, child] of parent.children.entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: row.id,
          sortOrder: childIndex,
          imageUrl: null,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: row.id,
          sortOrder: childIndex,
          accent: parent.accent,
          imageUrl: null,
        },
      });
    }
  }
}

async function main() {
  await removeDemoAccounts();
  await removePlaceholderProducts();
  await syncCategories();
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
