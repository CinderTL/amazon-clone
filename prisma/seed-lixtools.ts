import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus, Role, ShippingScope } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" }),
});

const STORE_NAME = "LixTools";
const STORE_SLUG = "lixtools";
const STORE_EMAIL = "lixtools@lixazon.com";
const INITIAL_PASSWORD = "LixTools";
const DEFAULT_STOCK = 25;

const PRODUCTS = [
  {
    name: "Bulk Rename Utility (For Linux) — USB (8GB)",
    slug: "bulk-rename-utility-linux-usb-8gb",
    price: 14.99,
    categorySlug: "memory-cards",
    description:
      "Bulk Rename Utility for Linux, preloaded on an 8GB USB drive. Quickly rename hundreds or even thousands of files in a single operation instead of manually editing each filename. Useful for organizing photos, documents, downloads, project files, and other large collections. Simply connect the USB drive to your Linux computer, launch the utility, and start organizing your files.",
  },
  {
    name: "Linux Rescue Toolkit — USB (32GB)",
    slug: "linux-rescue-toolkit-usb-32gb",
    price: 19.99,
    categorySlug: "memory-cards",
    description:
      "A bootable 32GB USB drive packed with essential Linux recovery and troubleshooting tools. Recover files, diagnose storage drives, troubleshoot system problems, and perform basic maintenance without needing to boot into your installed operating system.",
  },
  {
    name: "Portable NVMe SSD Enclosure — USB-C",
    slug: "portable-nvme-ssd-enclosure-usb-c",
    price: 29.99,
    categorySlug: "memory-cards",
    description:
      "Turn an unused M.2 NVMe SSD into a fast portable drive with this compact USB-C enclosure. Featuring a durable aluminum housing and tool-free installation, it is ideal for backups, file transfers, additional storage, and taking your data wherever you go.",
  },
  {
    name: "Network Testing Toolkit — USB (16GB)",
    slug: "network-testing-toolkit-usb-16gb",
    price: 14.99,
    categorySlug: "memory-cards",
    description:
      "A portable collection of networking utilities provided on a 16GB USB drive. Useful for diagnosing connection problems, inspecting local networks, checking connected devices, and performing everyday network administration and troubleshooting tasks.",
  },
  {
    name: "USB-C Multiport Adapter — 7-in-1",
    slug: "usb-c-multiport-adapter-7-in-1",
    price: 39.99,
    categorySlug: "chargers-cables",
    description:
      "Expand your laptop's connectivity with a compact 7-in-1 USB-C adapter. Connect external displays, USB peripherals, SD and microSD cards, and other accessories through a single convenient hub. Perfect for laptops, workstations, and portable setups.",
  },
  {
    name: "PC Maintenance Toolkit — 32-Piece",
    slug: "pc-maintenance-toolkit-32-piece",
    price: 24.99,
    categorySlug: "laptops",
    description:
      "A practical 32-piece toolkit for maintaining and upgrading laptops, desktops, and other electronics. Includes precision screwdrivers, pry tools, tweezers, cleaning brushes, and other essentials for everyday computer maintenance and repairs.",
  },
  {
    name: "Privacy Screen Filter — 15.6\" Laptop",
    slug: "privacy-screen-filter-15-6-laptop",
    price: 19.99,
    categorySlug: "laptops",
    description:
      "A removable privacy filter designed for 15.6-inch laptop displays. It reduces visibility from side angles while keeping the screen clear when viewed directly. Ideal for working in offices, cafés, libraries, airports, and other shared spaces.",
  },
];

async function ensureSeller() {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: STORE_NAME, mode: "insensitive" } },
        { email: { equals: STORE_EMAIL, mode: "insensitive" } },
        { sellerProfile: { is: { OR: [{ storeName: { equals: STORE_NAME, mode: "insensitive" } }, { slug: STORE_SLUG }] } } },
      ],
    },
    include: { sellerProfile: true },
  });

  if (existing?.sellerProfile) {
    if (existing.role !== Role.SELLER) {
      await prisma.user.update({ where: { id: existing.id }, data: { role: Role.SELLER } });
    }
    return { seller: existing.sellerProfile, created: false };
  }

  if (existing) {
    const slugTaken = await prisma.sellerProfile.findUnique({ where: { slug: STORE_SLUG } });
    const seller = await prisma.sellerProfile.create({
      data: {
        userId: existing.id,
        storeName: STORE_NAME,
        slug: slugTaken ? `${STORE_SLUG}-${existing.id.slice(-4)}` : STORE_SLUG,
        description: "Linux utilities, recovery media, and computer accessories.",
      },
    });
    await prisma.user.update({ where: { id: existing.id }, data: { role: Role.SELLER } });
    return { seller, created: false };
  }

  const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: STORE_EMAIL,
      passwordHash,
      name: STORE_NAME,
      role: Role.SELLER,
      sellerProfile: {
        create: {
          storeName: STORE_NAME,
          slug: STORE_SLUG,
          description: "Linux utilities, recovery media, and computer accessories.",
        },
      },
    },
    include: { sellerProfile: true },
  });

  if (!user.sellerProfile) throw new Error("Could not create the LixTools store");
  return { seller: user.sellerProfile, created: true };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env before seeding LixTools products.");
  }

  const { seller, created } = await ensureSeller();
  const categories = await prisma.category.findMany({
    where: {
      slug: { in: [...new Set(PRODUCTS.map((product) => product.categorySlug))] },
      sellerId: null,
      parentId: { not: null },
    },
    select: { id: true, slug: true, name: true },
  });
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  for (const product of PRODUCTS) {
    const category = categoryBySlug.get(product.categorySlug);
    if (!category) {
      throw new Error(`Missing website subcategory "${product.categorySlug}". Run npm run db:essentials first.`);
    }

    const current = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (current && current.sellerId !== seller.id) {
      throw new Error(`Product slug "${product.slug}" already belongs to another store.`);
    }

    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      brand: STORE_NAME,
      categoryId: category.id,
      status: ProductStatus.PUBLISHED,
      active: true,
      shippingScope: ShippingScope.INTERNATIONAL,
    };

    if (current) {
      await prisma.product.update({ where: { id: current.id }, data });
      console.log(`Updated ${product.name} (${category.name})`);
      continue;
    }

    await prisma.product.create({
      data: {
        ...data,
        slug: product.slug,
        sellerId: seller.id,
        stock: DEFAULT_STOCK,
        imageUrl: "",
        images: [],
      },
    });
    console.log(`Created ${product.name} (${category.name})`);
  }

  console.log(`LixTools products are ready on /store/${seller.slug}.`);
  if (created) {
    console.log(`Created the LixTools seller. Sign in with ${STORE_EMAIL} / ${INITIAL_PASSWORD}`);
  }
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
