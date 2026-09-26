export const DEFAULT_CATEGORY_SLUG = "electronic-accessories";

export type CatalogChild = {
  name: string;
  slug: string;
};

export type CatalogCategory = {
  name: string;
  slug: string;
  description: string;
  accent: "coral" | "sky" | "mint" | "mustard";
  children: CatalogChild[];
};

export const CATEGORY_CATALOG: CatalogCategory[] = [
  {
    name: "Electronic Accessories",
    slug: "electronic-accessories",
    description: "Audio, power, and everyday device add-ons",
    accent: "sky",
    children: [
      { name: "Headsets", slug: "headsets" },
      { name: "Microphones", slug: "microphones" },
      { name: "Webcams", slug: "webcams" },
      { name: "Keyboards & Mice", slug: "keyboards-mice" },
      { name: "Chargers & Cables", slug: "chargers-cables" },
      { name: "Power Banks", slug: "power-banks" },
      { name: "Memory Cards", slug: "memory-cards" },
      { name: "Phone Cases", slug: "phone-cases" },
    ],
  },
  {
    name: "TV & Home Appliances",
    slug: "tv-home-appliances",
    description: "Screens and appliances for the home",
    accent: "mustard",
    children: [
      { name: "Televisions", slug: "televisions" },
      { name: "Air Conditioners", slug: "air-conditioners" },
      { name: "Refrigerators", slug: "refrigerators" },
      { name: "Washing Machines", slug: "washing-machines" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { name: "Vacuum Cleaners", slug: "vacuum-cleaners" },
    ],
  },
  {
    name: "Health & Beauty",
    slug: "health-beauty",
    description: "Care, color, and everyday wellness",
    accent: "coral",
    children: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Fragrances", slug: "fragrances" },
      { name: "Personal Care", slug: "personal-care" },
      { name: "Supplements", slug: "supplements" },
    ],
  },
  {
    name: "Mother & Baby",
    slug: "mother-baby",
    description: "Essentials for parents and little ones",
    accent: "mint",
    children: [
      { name: "Diapers", slug: "diapers" },
      { name: "Baby Food", slug: "baby-food" },
      { name: "Strollers", slug: "strollers" },
      { name: "Feeding", slug: "feeding" },
      { name: "Nursery", slug: "nursery" },
      { name: "Baby Clothing", slug: "baby-clothing" },
    ],
  },
  {
    name: "Electronic Devices",
    slug: "electronic-devices",
    description: "Phones, computers, and smart gear",
    accent: "sky",
    children: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops", slug: "laptops" },
      { name: "Tablets", slug: "tablets" },
      { name: "Cameras", slug: "cameras" },
      { name: "Smart Watches", slug: "smart-watches" },
      { name: "Gaming Consoles", slug: "gaming-consoles" },
    ],
  },
  {
    name: "Groceries & Pets",
    slug: "groceries-pets",
    description: "Pantry staples and pet care",
    accent: "coral",
    children: [
      { name: "Fresh Food", slug: "fresh-food" },
      { name: "Snacks", slug: "snacks" },
      { name: "Beverages", slug: "beverages" },
      { name: "Pet Food", slug: "pet-food" },
      { name: "Pet Accessories", slug: "pet-accessories" },
      { name: "Household Supplies", slug: "household-supplies" },
    ],
  },
  {
    name: "Home & Lifestyle",
    slug: "home-lifestyle",
    description: "Furniture, decor, and daily living",
    accent: "mustard",
    children: [
      { name: "Furniture", slug: "furniture" },
      { name: "Bedding", slug: "bedding" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Lighting", slug: "lighting" },
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Storage", slug: "storage" },
    ],
  },
  {
    name: "Women's Fashion",
    slug: "womens-fashion",
    description: "Clothing and accessories",
    accent: "coral",
    children: [
      { name: "Dresses", slug: "dresses" },
      { name: "Tops", slug: "tops" },
      { name: "Shoes", slug: "womens-shoes" },
      { name: "Bags", slug: "womens-bags" },
      { name: "Activewear", slug: "womens-activewear" },
      { name: "Outerwear", slug: "womens-outerwear" },
    ],
  },
  {
    name: "Men's Fashion",
    slug: "mens-fashion",
    description: "Everyday and occasion wear",
    accent: "sky",
    children: [
      { name: "Shirts", slug: "shirts" },
      { name: "Pants", slug: "pants" },
      { name: "Shoes", slug: "mens-shoes" },
      { name: "Outerwear", slug: "mens-outerwear" },
      { name: "Activewear", slug: "mens-activewear" },
      { name: "Accessories", slug: "mens-accessories" },
    ],
  },
  {
    name: "Kid's Fashion",
    slug: "kids-fashion",
    description: "Clothes and shoes for kids",
    accent: "mint",
    children: [
      { name: "Boys Clothing", slug: "boys-clothing" },
      { name: "Girls Clothing", slug: "girls-clothing" },
      { name: "Kids Shoes", slug: "kids-shoes" },
      { name: "School Bags", slug: "school-bags" },
      { name: "Baby Wear", slug: "baby-wear" },
    ],
  },
  {
    name: "Watches, Bags & Jewellery",
    slug: "watches-bags-jewellery",
    description: "Watches, bags, and jewellery",
    accent: "mustard",
    children: [
      { name: "Watches", slug: "watches" },
      { name: "Handbags", slug: "handbags" },
      { name: "Wallets", slug: "wallets" },
      { name: "Jewellery", slug: "jewellery" },
      { name: "Sunglasses", slug: "sunglasses" },
      { name: "Luggage", slug: "luggage" },
    ],
  },
  {
    name: "Sports & Outdoor",
    slug: "sports-outdoor",
    description: "Training, outdoor, and team gear",
    accent: "mint",
    children: [
      { name: "Fitness", slug: "fitness" },
      { name: "Cycling", slug: "cycling" },
      { name: "Outdoor", slug: "outdoor" },
      { name: "Team Sports", slug: "team-sports" },
      { name: "Camping", slug: "camping" },
      { name: "Sportswear", slug: "sportswear" },
    ],
  },
  {
    name: "Automotive & Motorbike",
    slug: "automotive-motorbike",
    description: "Car and motorbike essentials",
    accent: "sky",
    children: [
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Motorbike Gear", slug: "motorbike-gear" },
      { name: "Oils & Fluids", slug: "oils-fluids" },
      { name: "Tools", slug: "auto-tools" },
      { name: "Tires", slug: "tires" },
      { name: "Car Electronics", slug: "car-electronics" },
    ],
  },
];

/** Maps the previous flat catalog slugs onto the new subcategory tree. */
export const LEGACY_CATEGORY_SLUGS: Record<string, string> = {
  electronics: "headsets",
  tech: "laptops",
  accessories: "handbags",
  "home-kitchen": "kitchen-dining",
  apparel: "dresses",
  food: "snacks",
  sports: "fitness",
};
