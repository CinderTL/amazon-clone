import {
  UtensilsCrossed,
  Shirt,
  Cpu,
  Watch,
  Smartphone,
  CookingPot,
  Dumbbell,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export type NavCategory = {
  name: string;
  slug: string;
  icon: IconType;
};

/** Primary storefront category nav (order matters). */
export const NAV_CATEGORIES: NavCategory[] = [
  { name: "Food", slug: "food", icon: UtensilsCrossed },
  { name: "Apparel", slug: "apparel", icon: Shirt },
  { name: "Tech", slug: "tech", icon: Cpu },
  { name: "Accessories", slug: "accessories", icon: Watch },
  { name: "Electronics", slug: "electronics", icon: Smartphone },
  { name: "Home & Kitchen", slug: "home-kitchen", icon: CookingPot },
  { name: "Sports", slug: "sports", icon: Dumbbell },
];

export type PopularStrip = {
  name: string;
  slug: string;
  color: string;
  image: string;
};

/** Six popular category strips for the homepage. */
export const POPULAR_CATEGORIES: PopularStrip[] = [
  {
    name: "Electronics",
    slug: "electronics",
    color: "#4B7BFF",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  },
  {
    name: "Apparel",
    slug: "apparel",
    color: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    color: "#2EC4B6",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80",
  },
  {
    name: "Tech",
    slug: "tech",
    color: "#F4A261",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
  },
  {
    name: "Sports",
    slug: "sports",
    color: "#7C3AED",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  },
  {
    name: "Food",
    slug: "food",
    color: "#E11D48",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  },
];
