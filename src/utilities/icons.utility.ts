import React from 'react';
import {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger,
  IceCreamBowl, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, Dessert,
  Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut,
  Egg, GlassWater, Milk,
} from 'lucide-react';
import type { LucideProps, LucideIcon } from 'lucide-react';

// Mapeo de Íconos Lucide
const iconMapList = {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger,
  IceCreamBowl, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, Dessert,
  Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut,
  Egg, GlassWater, Milk,
};

export type IconName = keyof typeof iconMapList;

const iconMap: { [key in IconName | "default"]: LucideIcon } = {
  ...iconMapList,
  default: Utensils,
};

interface IconComponentProps extends LucideProps {
  iconName: IconName | null;
}

const IconComponent: React.FC<IconComponentProps> = React.memo(
  ({ iconName, size = 18, className = "mr-2 text-gray-600", color, ...rest }) => {
    const Icon = iconName ? iconMap[iconName] ?? iconMap.default : iconMap.default;
    return <Icon size={size} className={className} color={color} {...rest} />;
  }
);

export default IconComponent;
