import { PrismaClient, Role, OrderStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const UNSPLASH = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  "https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
  "https://images.unsplash.com/photo-1507473885761-ce6d7c0f4b0f?w=800&q=80",
  "https://images.unsplash.com/photo-1514228742587-6b15571fea9c?w=800&q=80",
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
  "https://images.unsplash.com/photo-1522335789203-aabdfe33c92c?w=800&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  "https://images.unsplash.com/photo-1599058945522-28d584b6f14f?w=800&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
  "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128ac?w=800&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80",
  "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
  "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
  "https://images.unsplash.com/photo-1571781926291-c77df8097c2?w=800&q=80",
  "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
  "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80",
  "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
];

function img(id: number) {
  return UNSPLASH[id % UNSPLASH.length];
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      passwordHash,
      name: "Casey Customer",
      role: Role.CUSTOMER,
      phone: "+1-555-0100",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: "seller@example.com",
      passwordHash,
      name: "Sam Seller",
      role: Role.SELLER,
      phone: "+1-555-0200",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const techUser = await prisma.user.create({
    data: {
      email: "techvault@example.com",
      passwordHash,
      name: "Taylor Tech",
      role: Role.SELLER,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const homeUser = await prisma.user.create({
    data: {
      email: "homestyle@example.com",
      passwordHash,
      name: "Harper Home",
      role: Role.SELLER,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const prime = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      storeName: "Prime Gear Co",
      slug: "prime-gear",
      description: "Everyday essentials with cheerful colors and solid build quality.",
      logoUrl: img(901),
      bannerUrl: img(902),
    },
  });

  const tech = await prisma.sellerProfile.create({
    data: {
      userId: techUser.id,
      storeName: "TechVault",
      slug: "techvault",
      description: "Gadgets and gear for modern living.",
      logoUrl: img(903),
      bannerUrl: img(904),
    },
  });

  const home = await prisma.sellerProfile.create({
    data: {
      userId: homeUser.id,
      storeName: "HomeStyle Living",
      slug: "homestyle",
      description: "Cozy home finds without the clutter.",
      logoUrl: img(905),
      bannerUrl: img(906),
    },
  });

  const topCats = [
    { name: "Food", slug: "food", accent: "coral", description: "Groceries, snacks, and pantry staples" },
    { name: "Apparel", slug: "apparel", accent: "coral", description: "Everyday style staples" },
    { name: "Tech", slug: "tech", accent: "mint", description: "Laptops, peripherals, and desks" },
    { name: "Accessories", slug: "accessories", accent: "mint", description: "Bags, wallets, and little lifts" },
    { name: "Electronics", slug: "electronics", accent: "sky", description: "Audio, wearables, and smart gear" },
    { name: "Home & Kitchen", slug: "home-kitchen", accent: "mustard", description: "Cookware and comfort" },
    { name: "Sports", slug: "sports", accent: "sky", description: "Move more, gear less" },
  ] as const;

  const categories: Record<string, string> = {};
  for (const [i, c] of topCats.entries()) {
    const cat = await prisma.category.create({
      data: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        accent: c.accent,
        imageUrl: img(100 + i),
      },
    });
    categories[c.slug] = cat.id;
  }

  type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAt?: number;
    stock: number;
    brand: string;
    category: keyof typeof categories;
    sellerId: string;
    featured?: boolean;
    seed: number;
    variants?: { sku: string; name: string; color?: string; size?: string; priceDelta?: number; stock: number }[];
  };

  const products: SeedProduct[] = [
    {
      name: "Aura Wireless Headphones",
      slug: "aura-wireless-headphones",
      description: "Soft cushions, punchy bass, and a 30-hour charge that keeps up with busy days.",
      price: 89.99,
      compareAt: 129.99,
      stock: 48,
      brand: "Aura",
      category: "electronics",
      sellerId: tech.id,
      featured: true,
      seed: 1,
      variants: [
        { sku: "AURA-HP-BLK", name: "Black", color: "Black", stock: 24 },
        { sku: "AURA-HP-WHT", name: "White", color: "White", stock: 24 },
      ],
    },
    {
      name: "Nimbus Smart Watch",
      slug: "nimbus-smart-watch",
      description: "Track sleep, steps, and notifications without a crowded interface.",
      price: 149.0,
      compareAt: 179.0,
      stock: 35,
      brand: "Nimbus",
      category: "electronics",
      sellerId: tech.id,
      featured: true,
      seed: 2,
    },
    {
      name: "Pulse Portable Speaker",
      slug: "pulse-portable-speaker",
      description: "IPX7 splash-proof speaker with warm stereo for kitchens and patios.",
      price: 59.5,
      stock: 60,
      brand: "Pulse",
      category: "electronics",
      sellerId: prime.id,
      featured: true,
      seed: 3,
    },
    {
      name: "Frame 14 Laptop",
      slug: "frame-14-laptop",
      description: "Lightweight 14\" laptop with all-day battery and quiet keyboard.",
      price: 899.0,
      compareAt: 999.0,
      stock: 18,
      brand: "Frame",
      category: "tech",
      sellerId: tech.id,
      featured: true,
      seed: 4,
      variants: [
        { sku: "FR14-8-256", name: "8GB / 256GB", size: "8/256", stock: 10 },
        { sku: "FR14-16-512", name: "16GB / 512GB", size: "16/512", priceDelta: 200, stock: 8 },
      ],
    },
    {
      name: "Orbit Mechanical Keyboard",
      slug: "orbit-mechanical-keyboard",
      description: "Tactile switches, hot-swap sockets, and a clean low profile.",
      price: 119.0,
      stock: 40,
      brand: "Orbit",
      category: "tech",
      sellerId: tech.id,
      seed: 5,
    },
    {
      name: "Drift Wireless Mouse",
      slug: "drift-wireless-mouse",
      description: "Quiet clicks and multi-device pairing for desks that stay tidy.",
      price: 39.99,
      stock: 75,
      brand: "Drift",
      category: "tech",
      sellerId: prime.id,
      seed: 6,
    },
    {
      name: "ClearCase MagSafe Shell",
      slug: "clearcase-magsafe-shell",
      description: "Crystal case with soft corners and MagSafe-ready ring.",
      price: 24.99,
      stock: 120,
      brand: "ClearCase",
      category: "electronics",
      sellerId: prime.id,
      featured: true,
      seed: 7,
      variants: [
        { sku: "CC-15", name: "iPhone 15", size: "15", stock: 40 },
        { sku: "CC-15P", name: "iPhone 15 Pro", size: "15 Pro", stock: 40 },
        { sku: "CC-16", name: "iPhone 16", size: "16", stock: 40 },
      ],
    },
    {
      name: "Bolt 65W GaN Charger",
      slug: "bolt-65w-gan-charger",
      description: "Two USB-C ports that charge laptop and phone without bulk.",
      price: 34.0,
      stock: 90,
      brand: "Bolt",
      category: "electronics",
      sellerId: tech.id,
      seed: 8,
    },
    {
      name: "Lumen Desk Lamp",
      slug: "lumen-desk-lamp",
      description: "Warm-to-cool LED with a soft rounded shade and dimmer.",
      price: 45.0,
      stock: 55,
      brand: "Lumen",
      category: "home-kitchen",
      sellerId: home.id,
      featured: true,
      seed: 9,
    },
    {
      name: "Nest Ceramic Mug Set",
      slug: "nest-ceramic-mug-set",
      description: "Set of four 12oz mugs in coral, sky, mint, and mustard.",
      price: 32.0,
      stock: 70,
      brand: "Nest",
      category: "home-kitchen",
      sellerId: home.id,
      seed: 10,
    },
    {
      name: "Harbor Nonstick Pan",
      slug: "harbor-nonstick-pan",
      description: "10-inch pan with even heat and a comfortable stay-cool handle.",
      price: 48.0,
      compareAt: 62.0,
      stock: 42,
      brand: "Harbor",
      category: "home-kitchen",
      sellerId: home.id,
      seed: 11,
    },
    {
      name: "Cloud Soft Tee",
      slug: "cloud-soft-tee",
      description: "Midweight cotton tee with a relaxed fit and clean hem.",
      price: 28.0,
      stock: 100,
      brand: "Cloud",
      category: "apparel",
      sellerId: prime.id,
      featured: true,
      seed: 12,
      variants: [
        { sku: "CST-S-NVY", name: "Navy / S", color: "Navy", size: "S", stock: 25 },
        { sku: "CST-M-NVY", name: "Navy / M", color: "Navy", size: "M", stock: 25 },
        { sku: "CST-L-NVY", name: "Navy / L", color: "Navy", size: "L", stock: 25 },
        { sku: "CST-M-WHT", name: "White / M", color: "White", size: "M", stock: 25 },
      ],
    },
    {
      name: "Stride Everyday Sneaker",
      slug: "stride-everyday-sneaker",
      description: "Cushioned sole and breathable upper for all-day wear.",
      price: 78.0,
      compareAt: 98.0,
      stock: 64,
      brand: "Stride",
      category: "apparel",
      sellerId: prime.id,
      seed: 13,
      variants: [
        { sku: "STR-8", name: "US 8", size: "8", stock: 16 },
        { sku: "STR-9", name: "US 9", size: "9", stock: 16 },
        { sku: "STR-10", name: "US 10", size: "10", stock: 16 },
        { sku: "STR-11", name: "US 11", size: "11", stock: 16 },
      ],
    },
    {
      name: "Dew Glow Serum",
      slug: "dew-glow-serum",
      description: "Lightweight hydration with a soft finish—no sticky film.",
      price: 36.0,
      stock: 80,
      brand: "Dew",
      category: "food",
      sellerId: home.id,
      featured: true,
      seed: 14,
    },
    {
      name: "Silk Soft Hair Towel",
      slug: "silk-soft-hair-towel",
      description: "Absorbent wrap that cuts dry time without frizz.",
      price: 22.0,
      stock: 95,
      brand: "Silk Soft",
      category: "food",
      sellerId: home.id,
      seed: 15,
    },
    {
      name: "Trail Day Pack 20L",
      slug: "trail-day-pack-20l",
      description: "Water-resistant daypack with laptop sleeve and bottle pockets.",
      price: 64.0,
      stock: 50,
      brand: "Trail",
      category: "sports",
      sellerId: prime.id,
      featured: true,
      seed: 16,
    },
    {
      name: "Flex Resistance Bands",
      slug: "flex-resistance-bands",
      description: "Five levels in a carry pouch for quick home sessions.",
      price: 19.99,
      stock: 110,
      brand: "Flex",
      category: "sports",
      sellerId: prime.id,
      seed: 17,
    },
    {
      name: "Focus Flow Journal",
      slug: "focus-flow-journal",
      description: "Undated weekly planner with calm layouts and thick paper.",
      price: 18.0,
      stock: 85,
      brand: "Focus",
      category: "food",
      sellerId: home.id,
      seed: 18,
    },
    {
      name: "Kitchen Confidence Cookbook",
      slug: "kitchen-confidence-cookbook",
      description: "120 simple recipes with bright photography and clear steps.",
      price: 26.0,
      stock: 45,
      brand: "Kitchen Confidence",
      category: "food",
      sellerId: home.id,
      seed: 19,
    },
    {
      name: "Nova Pro Controller",
      slug: "nova-pro-controller",
      description: "Hall-effect sticks, soft grips, and quick-charge USB-C.",
      price: 69.0,
      compareAt: 79.0,
      stock: 58,
      brand: "Nova",
      category: "tech",
      sellerId: tech.id,
      featured: true,
      seed: 20,
    },
    {
      name: "Pivot Gaming Chair",
      slug: "pivot-gaming-chair",
      description: "Breathable mesh and lumbar support without race-car noise.",
      price: 249.0,
      stock: 22,
      brand: "Pivot",
      category: "tech",
      sellerId: tech.id,
      seed: 21,
    },
    {
      name: "Loop Crossbody Bag",
      slug: "loop-crossbody-bag",
      description: "Compact bag with RFID pocket and adjustable strap.",
      price: 42.0,
      stock: 66,
      brand: "Loop",
      category: "accessories",
      sellerId: prime.id,
      featured: true,
      seed: 22,
    },
    {
      name: "Halo Slim Wallet",
      slug: "halo-slim-wallet",
      description: "Aluminum card holder with quick-access cash clip.",
      price: 29.0,
      stock: 88,
      brand: "Halo",
      category: "accessories",
      sellerId: prime.id,
      seed: 23,
    },
    {
      name: "Beacon LED Strip Kit",
      slug: "beacon-led-strip-kit",
      description: "App-ready RGB strip with adhesive backing and power brick.",
      price: 27.5,
      stock: 73,
      brand: "Beacon",
      category: "electronics",
      sellerId: tech.id,
      seed: 24,
    },
    {
      name: "Quiet USB Hub 7-Port",
      slug: "quiet-usb-hub-7-port",
      description: "Powered hub that stays cool and keeps cables organized.",
      price: 31.0,
      stock: 54,
      brand: "Quiet",
      category: "tech",
      sellerId: tech.id,
      seed: 25,
    },
    {
      name: "Glass Screen Guard Duo",
      slug: "glass-screen-guard-duo",
      description: "Two tempered layers with an alignment tray.",
      price: 14.99,
      stock: 140,
      brand: "Glass",
      category: "electronics",
      sellerId: prime.id,
      seed: 26,
    },
    {
      name: "Bloom Diffuser Mini",
      slug: "bloom-diffuser-mini",
      description: "Quiet ultrasonic diffuser with auto shut-off.",
      price: 38.0,
      stock: 47,
      brand: "Bloom",
      category: "home-kitchen",
      sellerId: home.id,
      seed: 27,
    },
    {
      name: "River Linen Shirt",
      slug: "river-linen-shirt",
      description: "Breathable linen-blend button-up for warm weather.",
      price: 54.0,
      stock: 52,
      brand: "River",
      category: "apparel",
      sellerId: prime.id,
      seed: 28,
      variants: [
        { sku: "RLS-M-SAND", name: "Sand / M", color: "Sand", size: "M", stock: 26 },
        { sku: "RLS-L-SAND", name: "Sand / L", color: "Sand", size: "L", stock: 26 },
      ],
    },
    {
      name: "Calm Night Cream",
      slug: "calm-night-cream",
      description: "Ceramide cream that sinks in fast for overnight repair.",
      price: 41.0,
      stock: 61,
      brand: "Calm",
      category: "food",
      sellerId: home.id,
      seed: 29,
    },
    {
      name: "Tempo Yoga Mat",
      slug: "tempo-yoga-mat",
      description: "5mm cushion with grippy texture and carry strap.",
      price: 44.0,
      stock: 57,
      brand: "Tempo",
      category: "sports",
      sellerId: prime.id,
      seed: 30,
    },
    {
      name: "Tiny Habits Pocket Book",
      slug: "tiny-habits-pocket-book",
      description: "A short guide to stacking small routines that stick.",
      price: 12.0,
      stock: 100,
      brand: "Pocket Press",
      category: "food",
      sellerId: home.id,
      seed: 31,
    },
    {
      name: "Echo Headset Stand",
      slug: "echo-headset-stand",
      description: "Weighted base with USB passthrough for tidy desks.",
      price: 23.0,
      stock: 68,
      brand: "Echo",
      category: "tech",
      sellerId: tech.id,
      seed: 32,
    },
    {
      name: "Spark Key Organizer",
      slug: "spark-key-organizer",
      description: "Compact key holder that silences jingles in your pocket.",
      price: 16.0,
      stock: 130,
      brand: "Spark",
      category: "accessories",
      sellerId: prime.id,
      seed: 33,
    },
    {
      name: "Vista Webcam 1080p",
      slug: "vista-webcam-1080p",
      description: "Auto-light correction and a privacy shutter built in.",
      price: 52.0,
      stock: 49,
      brand: "Vista",
      category: "tech",
      sellerId: tech.id,
      featured: true,
      seed: 34,
    },
    {
      name: "Cove Throw Blanket",
      slug: "cove-throw-blanket",
      description: "Soft knit throw in muted coral for sofas and reading nooks.",
      price: 49.0,
      stock: 38,
      brand: "Cove",
      category: "home-kitchen",
      sellerId: home.id,
      featured: true,
      seed: 35,
    },
    {
      name: "Rally Running Socks 3-Pack",
      slug: "rally-running-socks-3-pack",
      description: "Cushioned arches and seamless toes in a bright trio.",
      price: 21.0,
      stock: 150,
      brand: "Rally",
      category: "sports",
      sellerId: prime.id,
      seed: 36,
    },
  ];

  const createdProducts = [];
  for (const p of products) {
    const images = [img(p.seed), img(p.seed + 200), img(p.seed + 400)];
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAt: p.compareAt,
        stock: p.stock,
        imageUrl: images[0],
        images,
        brand: p.brand,
        featured: Boolean(p.featured),
        categoryId: categories[p.category],
        sellerId: p.sellerId,
        rating: 4 + (p.seed % 10) / 10,
        reviewCount: 0,
        variants: p.variants
          ? {
              create: p.variants.map((v) => ({
                sku: v.sku,
                name: v.name,
                color: v.color,
                size: v.size,
                priceDelta: v.priceDelta ?? 0,
                stock: v.stock,
              })),
            }
          : undefined,
      },
      include: { variants: true },
    });
    createdProducts.push(product);
  }

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      fullName: "Casey Customer",
      line1: "128 Market Street",
      line2: "Apt 4B",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
      phone: "+1-555-0100",
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Work",
      fullName: "Casey Customer",
      line1: "500 Congress Ave",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
      phone: "+1-555-0101",
      isDefault: false,
    },
  });

  const headphones = createdProducts.find((p) => p.slug === "aura-wireless-headphones")!;
  const mug = createdProducts.find((p) => p.slug === "nest-ceramic-mug-set")!;
  const tee = createdProducts.find((p) => p.slug === "cloud-soft-tee")!;

  await prisma.cartItem.create({
    data: {
      cartId: (await prisma.cart.findUniqueOrThrow({ where: { userId: customer.id } })).id,
      productId: headphones.id,
      variantId: headphones.variants[0]?.id,
      quantity: 1,
    },
  });
  await prisma.cartItem.create({
    data: {
      cartId: (await prisma.cart.findUniqueOrThrow({ where: { userId: customer.id } })).id,
      productId: mug.id,
      quantity: 2,
    },
  });

  await prisma.wishlistItem.create({
    data: {
      wishlistId: (await prisma.wishlist.findUniqueOrThrow({ where: { userId: customer.id } })).id,
      productId: tee.id,
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: "LX-1001",
      userId: customer.id,
      addressId: address.id,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.SUCCEEDED,
      subtotal: headphones.price + mug.price,
      shipping: 5.99,
      tax: 7.2,
      total: headphones.price + mug.price + 5.99 + 7.2,
      paymentMethod: "Stripe (test)",
      shippingName: address.fullName,
      shippingLine1: address.line1,
      shippingLine2: address.line2,
      shippingCity: address.city,
      shippingState: address.state,
      shippingPostal: address.postalCode,
      shippingCountry: address.country,
      shippingPhone: address.phone,
      items: {
        create: [
          {
            productId: headphones.id,
            sellerId: headphones.sellerId,
            name: headphones.name,
            imageUrl: headphones.imageUrl,
            variantLabel: headphones.variants[0]?.name,
            price: headphones.price,
            quantity: 1,
          },
          {
            productId: mug.id,
            sellerId: mug.sellerId,
            name: mug.name,
            imageUrl: mug.imageUrl,
            price: mug.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  const reviews = [
    {
      productId: headphones.id,
      rating: 5,
      title: "Comfortable all day",
      body: "Light on the head and battery lasts through a work week.",
    },
    {
      productId: mug.id,
      rating: 4,
      title: "Cheerful set",
      body: "Colors match the Lixazon vibe. Microwave safe as promised.",
    },
  ];

  for (const r of reviews) {
    await prisma.review.create({
      data: { ...r, userId: customer.id },
    });
    const agg = await prisma.review.aggregate({
      where: { productId: r.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: r.productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      },
    });
  }

  // A few more sample orders for seller dashboards
  const speaker = createdProducts.find((p) => p.slug === "pulse-portable-speaker")!;
  await prisma.order.create({
    data: {
      orderNumber: "LX-1002",
      userId: customer.id,
      addressId: address.id,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.SUCCEEDED,
      subtotal: speaker.price,
      shipping: 0,
      tax: 2.1,
      total: speaker.price + 2.1,
      paymentMethod: "Stripe (test)",
      shippingName: address.fullName,
      shippingLine1: address.line1,
      shippingCity: address.city,
      shippingState: address.state,
      shippingPostal: address.postalCode,
      shippingCountry: address.country,
      items: {
        create: [
          {
            productId: speaker.id,
            sellerId: speaker.sellerId,
            name: speaker.name,
            imageUrl: speaker.imageUrl,
            price: speaker.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log(`Seeded ${createdProducts.length} products, order ${order.orderNumber}`);
  console.log("Demo: customer@example.com / seller@example.com — password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
