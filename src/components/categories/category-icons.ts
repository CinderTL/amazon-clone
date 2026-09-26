import {
  Baby,
  Car,
  Dumbbell,
  Gem,
  Headphones,
  HeartPulse,
  Home,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Tv,
  Watch,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "electronic-accessories": Headphones,
  "tv-home-appliances": Tv,
  "health-beauty": HeartPulse,
  "mother-baby": Baby,
  "electronic-devices": Smartphone,
  "groceries-pets": ShoppingBasket,
  "home-lifestyle": Home,
  "womens-fashion": Shirt,
  "mens-fashion": Shirt,
  "kids-fashion": Baby,
  "watches-bags-jewellery": Watch,
  "sports-outdoor": Dumbbell,
  "automotive-motorbike": Car,
};

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Gem;
}
