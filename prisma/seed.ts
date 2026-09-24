import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function img(seed: number, w = 600, h = 600) {
  return `https://picsum.photos/seed/mh${seed}/${w}/${h}`;
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      passwordHash,
      name: "Alex Customer",
      role: Role.CUSTOMER,
      phone: "+1 555-0100",
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      email: "seller@example.com",
      passwordHash,
      name: "Sam Seller",
      role: Role.SELLER,
      phone: "+1 555-0200",
    },
  });

  const seller2User = await prisma.user.create({
    data: {
      email: "techvault@example.com",
      passwordHash,
      name: "Jordan Lee",
      role: Role.SELLER,
    },
  });

  const seller3User = await prisma.user.create({
    data: {
      email: "homestyle@example.com",
      passwordHash,
      name: "Casey Morgan",
      role: Role.SELLER,
    },
  });

  const seller = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      storeName: "Prime Gear Co",
      slug: "prime-gear",
      description: "Quality electronics and everyday essentials from a trusted Lixazon seller.",
      logoUrl: img(901, 200, 200),
      bannerUrl: img(902, 1200, 300),
    },
  });

  const seller2 = await prisma.sellerProfile.create({
    data: {
      userId: seller2User.id,
      storeName: "TechVault",
      slug: "techvault",
      description: "Computers, phones, and gaming gear curated for power users.",
      logoUrl: img(903, 200, 200),
      bannerUrl: img(904, 1200, 300),
    },
  });

  const seller3 = await prisma.sellerProfile.create({
    data: {
      userId: seller3User.id,
      storeName: "HomeStyle Living",
      slug: "homestyle",
      description: "Home, kitchen, fashion, and beauty picks for modern living.",
      logoUrl: img(905, 200, 200),
      bannerUrl: img(906, 1200, 300),
    },
  });

  const categoryDefs = [
    { name: "Electronics", slug: "electronics", description: "TVs, audio, cameras, and more", seed: 1 },
    { name: "Computers", slug: "computers", description: "Laptops, desktops, and peripherals", seed: 2 },
    { name: "Phones", slug: "phones", description: "Smartphones and mobile accessories", seed: 3 },
    { name: "Home & Kitchen", slug: "home-kitchen", description: "Appliances and home essentials", seed: 4 },
    { name: "Fashion", slug: "fashion", description: "Clothing, shoes, and style", seed: 5 },
    { name: "Beauty", slug: "beauty", description: "Skincare, makeup, and wellness", seed: 6 },
    { name: "Sports", slug: "sports", description: "Fitness and outdoor gear", seed: 7 },
    { name: "Books", slug: "books", description: "Bestsellers and new releases", seed: 8 },
    { name: "Gaming", slug: "gaming", description: "Consoles, games, and accessories", seed: 9 },
    { name: "Accessories", slug: "accessories", description: "Bags, watches, and everyday extras", seed: 10 },
  ];

  const categories: Awaited<ReturnType<typeof prisma.category.create>>[] = [];
  for (const c of categoryDefs) {
    categories.push(
      await prisma.category.create({
        data: {
          name: c.name,
          slug: c.slug,
          description: c.description,
          imageUrl: img(c.seed, 400, 300),
        },
      })
    );
  }

  const cat = (slug: string) => categories.find((c) => c.slug === slug)!;

  type ProductSeed = {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAt?: number;
    stock: number;
    brand: string;
    category: string;
    seller: typeof seller;
    featured?: boolean;
    rating: number;
    reviewCount: number;
    seed: number;
  };

  const products: ProductSeed[] = [
    {
      name: "Aurora 55\" 4K Smart TV",
      slug: "aurora-55-4k-smart-tv",
      description: "Crisp 4K UHD display with HDR10+, built-in streaming apps, and voice remote. Perfect for movies and sports.",
      price: 449.99,
      compareAt: 599.99,
      stock: 42,
      brand: "Aurora",
      category: "electronics",
      seller,
      featured: true,
      rating: 4.6,
      reviewCount: 128,
      seed: 101,
    },
    {
      name: "SoundWave Portable Bluetooth Speaker",
      slug: "soundwave-portable-bluetooth-speaker",
      description: "360° sound, 20-hour battery, IPX7 waterproof. Take the party anywhere.",
      price: 79.99,
      compareAt: 99.99,
      stock: 120,
      brand: "SoundWave",
      category: "electronics",
      seller,
      featured: true,
      rating: 4.4,
      reviewCount: 89,
      seed: 102,
    },
    {
      name: "LensPro Mirrorless Camera Kit",
      slug: "lenspro-mirrorless-camera-kit",
      description: "24MP sensor, 4K video, and a versatile 18-55mm lens. Ideal for creators and travelers.",
      price: 899.0,
      stock: 18,
      brand: "LensPro",
      category: "electronics",
      seller: seller2,
      rating: 4.8,
      reviewCount: 54,
      seed: 103,
    },
    {
      name: "Nimbus Wireless Noise-Canceling Headphones",
      slug: "nimbus-wireless-noise-canceling-headphones",
      description: "Active noise canceling, 30-hour battery, plush ear cushions, and multipoint Bluetooth.",
      price: 199.99,
      compareAt: 249.99,
      stock: 75,
      brand: "Nimbus",
      category: "electronics",
      seller,
      featured: true,
      rating: 4.7,
      reviewCount: 210,
      seed: 104,
    },
    {
      name: "PixelBook Pro 14 Laptop",
      slug: "pixelbook-pro-14-laptop",
      description: "14\" Retina-class display, 16GB RAM, 512GB SSD, all-day battery. Built for work and creation.",
      price: 1299.0,
      compareAt: 1499.0,
      stock: 25,
      brand: "PixelBook",
      category: "computers",
      seller: seller2,
      featured: true,
      rating: 4.5,
      reviewCount: 76,
      seed: 105,
    },
    {
      name: "SwiftKey Mechanical Keyboard",
      slug: "swiftkey-mechanical-keyboard",
      description: "Hot-swappable switches, RGB lighting, aluminum frame. Designed for gamers and typists.",
      price: 129.99,
      stock: 90,
      brand: "SwiftKey",
      category: "computers",
      seller: seller2,
      rating: 4.3,
      reviewCount: 142,
      seed: 106,
    },
    {
      name: "Orbit UltraWide Monitor 34\"",
      slug: "orbit-ultrawide-monitor-34",
      description: "34\" ultrawide QHD, 144Hz refresh, USB-C docking. Expand your workspace.",
      price: 549.0,
      stock: 30,
      brand: "Orbit",
      category: "computers",
      seller: seller2,
      featured: true,
      rating: 4.6,
      reviewCount: 61,
      seed: 107,
    },
    {
      name: "CloudDesk USB-C Hub 8-in-1",
      slug: "clouddesk-usb-c-hub-8-in-1",
      description: "HDMI 4K, dual USB-A, SD/microSD, Ethernet, and 100W power delivery passthrough.",
      price: 49.99,
      stock: 200,
      brand: "CloudDesk",
      category: "computers",
      seller,
      rating: 4.2,
      reviewCount: 330,
      seed: 108,
    },
    {
      name: "NovaPhone X12 128GB",
      slug: "novaphone-x12-128gb",
      description: "6.5\" OLED, triple camera, 5G, all-day battery. Flagship performance at a great price.",
      price: 699.0,
      compareAt: 799.0,
      stock: 55,
      brand: "Nova",
      category: "phones",
      seller: seller2,
      featured: true,
      rating: 4.5,
      reviewCount: 198,
      seed: 109,
    },
    {
      name: "NovaPhone X12 Clear Case",
      slug: "novaphone-x12-clear-case",
      description: "Shock-absorbing clear case with raised edges. MagSafe compatible.",
      price: 24.99,
      stock: 300,
      brand: "Nova",
      category: "phones",
      seller,
      rating: 4.1,
      reviewCount: 420,
      seed: 110,
    },
    {
      name: "ChargeMax Mag Wireless Pad",
      slug: "chargemax-mag-wireless-pad",
      description: "15W magnetic wireless charging with LED indicator and cable included.",
      price: 34.99,
      stock: 150,
      brand: "ChargeMax",
      category: "phones",
      seller,
      rating: 4.3,
      reviewCount: 95,
      seed: 111,
    },
    {
      name: "Aura Smart Watch SE",
      slug: "aura-smart-watch-se",
      description: "Heart rate, SpO2, GPS, and 7-day battery. Track workouts and stay connected.",
      price: 179.99,
      stock: 80,
      brand: "Aura",
      category: "phones",
      seller: seller2,
      featured: true,
      rating: 4.4,
      reviewCount: 112,
      seed: 112,
    },
    {
      name: "BrewMaster Pour-Over Coffee Set",
      slug: "brewmaster-pour-over-coffee-set",
      description: "Borosilicate carafe, gooseneck kettle, and reusable filter for café-quality coffee at home.",
      price: 59.99,
      stock: 70,
      brand: "BrewMaster",
      category: "home-kitchen",
      seller: seller3,
      rating: 4.7,
      reviewCount: 88,
      seed: 113,
    },
    {
      name: "ChefEdge Nonstick Pan Set (3pc)",
      slug: "chefedge-nonstick-pan-set-3pc",
      description: "PFOA-free nonstick coating, induction ready, oven-safe handles up to 450°F.",
      price: 89.99,
      compareAt: 119.99,
      stock: 45,
      brand: "ChefEdge",
      category: "home-kitchen",
      seller: seller3,
      featured: true,
      rating: 4.5,
      reviewCount: 156,
      seed: 114,
    },
    {
      name: "PureAir Compact Humidifier",
      slug: "pureair-compact-humidifier",
      description: "Quiet ultrasonic humidifier with night light and auto shut-off. Ideal for bedrooms.",
      price: 39.99,
      stock: 110,
      brand: "PureAir",
      category: "home-kitchen",
      seller: seller3,
      rating: 4.2,
      reviewCount: 203,
      seed: 115,
    },
    {
      name: "NestWeave Throw Blanket Queen",
      slug: "nestweave-throw-blanket-queen",
      description: "Ultra-soft knit throw in charcoal. Machine washable and perfect for cozy nights.",
      price: 45.0,
      stock: 95,
      brand: "NestWeave",
      category: "home-kitchen",
      seller: seller3,
      rating: 4.6,
      reviewCount: 67,
      seed: 116,
    },
    {
      name: "TrailRunner Everyday Sneakers",
      slug: "trailrunner-everyday-sneakers",
      description: "Breathable knit upper, cushioned midsole, and durable outsole for all-day comfort.",
      price: 84.99,
      stock: 130,
      brand: "TrailRunner",
      category: "fashion",
      seller: seller3,
      featured: true,
      rating: 4.4,
      reviewCount: 245,
      seed: 117,
    },
    {
      name: "UrbanLayer Merino Crew Sweater",
      slug: "urbanlayer-merino-crew-sweater",
      description: "Fine merino wool crewneck. Soft, temperature-regulating, and machine washable.",
      price: 98.0,
      stock: 60,
      brand: "UrbanLayer",
      category: "fashion",
      seller: seller3,
      rating: 4.5,
      reviewCount: 73,
      seed: 118,
    },
    {
      name: "DayPack Slim Crossbody Bag",
      slug: "daypack-slim-crossbody-bag",
      description: "Water-resistant nylon, RFID pocket, and adjustable strap. City-ready essentials.",
      price: 42.99,
      stock: 85,
      brand: "DayPack",
      category: "fashion",
      seller: seller3,
      rating: 4.3,
      reviewCount: 119,
      seed: 119,
    },
    {
      name: "GlowLab Vitamin C Serum 30ml",
      slug: "glowlab-vitamin-c-serum-30ml",
      description: "Brightening serum with 15% vitamin C and hyaluronic acid. Dermatologist tested.",
      price: 28.99,
      stock: 180,
      brand: "GlowLab",
      category: "beauty",
      seller: seller3,
      featured: true,
      rating: 4.6,
      reviewCount: 512,
      seed: 120,
    },
    {
      name: "SilkTouch Moisturizing Cream",
      slug: "silktouch-moisturizing-cream",
      description: "Rich daily moisturizer with ceramides and shea butter for dry to normal skin.",
      price: 22.5,
      stock: 160,
      brand: "SilkTouch",
      category: "beauty",
      seller: seller3,
      rating: 4.4,
      reviewCount: 287,
      seed: 121,
    },
    {
      name: "FreshMist Face Mist Spray",
      slug: "freshmist-face-mist-spray",
      description: "Hydrating rosewater mist for on-the-go refresh. Alcohol-free formula.",
      price: 14.99,
      stock: 220,
      brand: "FreshMist",
      category: "beauty",
      seller: seller3,
      rating: 4.1,
      reviewCount: 94,
      seed: 122,
    },
    {
      name: "FlexBand Resistance Set",
      slug: "flexband-resistance-set",
      description: "5 resistance bands with handles, door anchor, and carry bag. Full-body workouts at home.",
      price: 29.99,
      stock: 140,
      brand: "FlexBand",
      category: "sports",
      seller,
      featured: true,
      rating: 4.5,
      reviewCount: 178,
      seed: 123,
    },
    {
      name: "PeakTrail Hiking Daypack 25L",
      slug: "peaktrail-hiking-daypack-25l",
      description: "Lightweight hydration-ready pack with ventilated back panel and rain cover.",
      price: 64.99,
      stock: 50,
      brand: "PeakTrail",
      category: "sports",
      seller,
      rating: 4.7,
      reviewCount: 82,
      seed: 124,
    },
    {
      name: "StrideFit Running Shorts",
      slug: "stridefit-running-shorts",
      description: "Moisture-wicking fabric with zip pocket and built-in liner. Race-day ready.",
      price: 32.0,
      stock: 100,
      brand: "StrideFit",
      category: "sports",
      seller: seller3,
      rating: 4.3,
      reviewCount: 145,
      seed: 125,
    },
    {
      name: "The Architecture of Everyday Things",
      slug: "architecture-of-everyday-things",
      description: "A modern classic on design thinking and why everyday objects succeed or fail.",
      price: 18.99,
      stock: 200,
      brand: "Lixazon Books",
      category: "books",
      seller,
      rating: 4.8,
      reviewCount: 890,
      seed: 126,
    },
    {
      name: "Deep Work: Focus Handbook",
      slug: "deep-work-focus-handbook",
      description: "Practical strategies for focused productivity in a distracted world.",
      price: 16.5,
      stock: 175,
      brand: "Lixazon Books",
      category: "books",
      seller,
      featured: true,
      rating: 4.6,
      reviewCount: 654,
      seed: 127,
    },
    {
      name: "Cookbook: Weeknight Kitchen",
      slug: "cookbook-weeknight-kitchen",
      description: "120 quick recipes for busy weeknights — from skillet dinners to sheet-pan meals.",
      price: 24.99,
      stock: 90,
      brand: "Lixazon Books",
      category: "books",
      seller: seller3,
      rating: 4.5,
      reviewCount: 211,
      seed: 128,
    },
    {
      name: "PlayBox Series X Console Bundle",
      slug: "playbox-series-x-console-bundle",
      description: "Next-gen console with 1TB SSD, wireless controller, and 3-month Game Pass.",
      price: 499.99,
      stock: 22,
      brand: "PlayBox",
      category: "gaming",
      seller: seller2,
      featured: true,
      rating: 4.7,
      reviewCount: 340,
      seed: 129,
    },
    {
      name: "Horizon Drift Racing Wheel",
      slug: "horizon-drift-racing-wheel",
      description: "Force-feedback racing wheel with pedals. Compatible with PC and consoles.",
      price: 249.0,
      stock: 35,
      brand: "Horizon",
      category: "gaming",
      seller: seller2,
      rating: 4.4,
      reviewCount: 58,
      seed: 130,
    },
    {
      name: "QuestRealm VR Starter Kit",
      slug: "questrealm-vr-starter-kit",
      description: "Standalone VR headset with controllers, elite strap, and carrying case.",
      price: 399.0,
      compareAt: 449.0,
      stock: 28,
      brand: "QuestRealm",
      category: "gaming",
      seller: seller2,
      featured: true,
      rating: 4.5,
      reviewCount: 167,
      seed: 131,
    },
    {
      name: "PixelPad Pro Wireless Controller",
      slug: "pixelpad-pro-wireless-controller",
      description: "Hall-effect sticks, programmable buttons, and 40-hour battery life.",
      price: 59.99,
      stock: 110,
      brand: "PixelPad",
      category: "gaming",
      seller: seller2,
      rating: 4.6,
      reviewCount: 224,
      seed: 132,
    },
    {
      name: "TravelLite Packable Backpack",
      slug: "travellite-packable-backpack",
      description: "Ultra-light packable daypack that folds into its own pocket. Perfect for travel.",
      price: 27.99,
      stock: 190,
      brand: "TravelLite",
      category: "accessories",
      seller,
      rating: 4.3,
      reviewCount: 301,
      seed: 133,
    },
    {
      name: "Chrono Minimal Watch Steel",
      slug: "chrono-minimal-watch-steel",
      description: "40mm stainless steel case, sapphire crystal, and Japanese quartz movement.",
      price: 149.0,
      stock: 40,
      brand: "Chrono",
      category: "accessories",
      seller,
      featured: true,
      rating: 4.7,
      reviewCount: 99,
      seed: 134,
    },
    {
      name: "ShadeCraft Polarized Sunglasses",
      slug: "shadecraft-polarized-sunglasses",
      description: "UV400 polarized lenses with lightweight acetate frames. Includes hard case.",
      price: 48.0,
      stock: 75,
      brand: "ShadeCraft",
      category: "accessories",
      seller: seller3,
      rating: 4.2,
      reviewCount: 134,
      seed: 135,
    },
    {
      name: "CableKit Braided USB-C 3-Pack",
      slug: "cablekit-braided-usb-c-3-pack",
      description: "Durable braided cables (3ft, 6ft, 10ft) with 100W PD support.",
      price: 19.99,
      stock: 250,
      brand: "CableKit",
      category: "accessories",
      seller,
      rating: 4.4,
      reviewCount: 780,
      seed: 136,
    },
  ];

  const createdProducts: Awaited<ReturnType<typeof prisma.product.create>>[] = [];
  for (const p of products) {
    const category = cat(p.category);
    const images = JSON.stringify([img(p.seed), img(p.seed + 1000), img(p.seed + 2000)]);
    createdProducts.push(
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAt: p.compareAt ?? null,
          stock: p.stock,
          imageUrl: img(p.seed),
          images,
          brand: p.brand,
          rating: p.rating,
          reviewCount: p.reviewCount,
          featured: p.featured ?? false,
          categoryId: category.id,
          sellerId: p.seller.id,
        },
      })
    );
  }

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Home",
      fullName: "Alex Customer",
      line1: "123 Market Street",
      line2: "Apt 4B",
      city: "Seattle",
      state: "WA",
      postalCode: "98101",
      country: "United States",
      phone: "+1 555-0100",
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Work",
      fullName: "Alex Customer",
      line1: "500 Commerce Ave",
      city: "Seattle",
      state: "WA",
      postalCode: "98104",
      country: "United States",
      phone: "+1 555-0101",
      isDefault: false,
    },
  });

  await prisma.cart.create({
    data: {
      userId: customer.id,
      items: {
        create: [
          { productId: createdProducts[0].id, quantity: 1 },
          { productId: createdProducts[4].id, quantity: 1 },
        ],
      },
    },
  });

  // Reviews
  const reviewTargets = [0, 1, 4, 8, 12, 16, 19, 22, 28, 33];
  for (const idx of reviewTargets) {
    const product = createdProducts[idx];
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: customer.id,
        rating: Math.max(3, Math.round(product.rating)),
        title: "Great purchase",
        body: `Really happy with ${product.name}. Shipping was fast and quality matches the listing.`,
      },
    });
  }

  // Orders for dashboard metrics
  const orderDefs: {
    status: OrderStatus;
    items: { productIndex: number; qty: number }[];
    daysAgo: number;
  }[] = [
    {
      status: OrderStatus.DELIVERED,
      items: [
        { productIndex: 0, qty: 1 },
        { productIndex: 3, qty: 1 },
      ],
      daysAgo: 21,
    },
    {
      status: OrderStatus.DELIVERED,
      items: [{ productIndex: 12, qty: 2 }],
      daysAgo: 14,
    },
    {
      status: OrderStatus.SHIPPED,
      items: [
        { productIndex: 4, qty: 1 },
        { productIndex: 7, qty: 2 },
      ],
      daysAgo: 5,
    },
    {
      status: OrderStatus.PROCESSING,
      items: [{ productIndex: 8, qty: 1 }],
      daysAgo: 2,
    },
    {
      status: OrderStatus.CONFIRMED,
      items: [
        { productIndex: 28, qty: 1 },
        { productIndex: 31, qty: 1 },
      ],
      daysAgo: 1,
    },
    {
      status: OrderStatus.PENDING,
      items: [{ productIndex: 16, qty: 1 }],
      daysAgo: 0,
    },
  ];

  let orderCounter = 1001;
  for (const od of orderDefs) {
    const items = od.items.map((i) => {
      const product = createdProducts[i.productIndex];
      return {
        product,
        qty: i.qty,
        lineTotal: product.price * i.qty,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - od.daysAgo);

    await prisma.order.create({
      data: {
        orderNumber: `LX-${orderCounter++}`,
        userId: customer.id,
        addressId: address.id,
        status: od.status,
        subtotal,
        shipping,
        tax,
        total,
        paymentMethod: "Demo Card ···· 4242",
        shippingName: address.fullName,
        shippingLine1: address.line1,
        shippingLine2: address.line2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPostal: address.postalCode,
        shippingCountry: address.country,
        shippingPhone: address.phone,
        createdAt,
        items: {
          create: items.map((i) => ({
            productId: i.product.id,
            sellerId: i.product.sellerId,
            name: i.product.name,
            imageUrl: i.product.imageUrl,
            price: i.product.price,
            quantity: i.qty,
          })),
        },
      },
    });
  }

  console.log("Seed complete:");
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Products: ${createdProducts.length}`);
  console.log(`  Sellers: 3`);
  console.log(`  Demo customer: customer@example.com / password123`);
  console.log(`  Demo seller: seller@example.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
