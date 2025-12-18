import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps, LucideIcon } from 'lucide-react';

const iconMapList = {
  Plus: LucideIcons.Plus,
  Coffee: LucideIcons.Coffee,
  Sandwich: LucideIcons.Sandwich,
  Apple: LucideIcons.Apple,
  Pizza: LucideIcons.Pizza,
  Trash2: LucideIcons.Trash2,
  FilePenLine: LucideIcons.FilePenLine,
  Beef: LucideIcons.Beef,
  Hamburger: LucideIcons.Hamburger,
  IceCreamBowl: LucideIcons.IceCreamBowl,
  Salad: LucideIcons.Salad,
  Soup: LucideIcons.Soup,
  Utensils: LucideIcons.Utensils,
  Wine: LucideIcons.Wine,
  Banana: LucideIcons.Banana,
  Cookie: LucideIcons.Cookie,
  Croissant: LucideIcons.Croissant,
  Dessert: LucideIcons.Dessert,
  Drumstick: LucideIcons.Drumstick,
  EggFried: LucideIcons.EggFried,
  Ham: LucideIcons.Ham,
  IceCreamCone: LucideIcons.IceCreamCone,
  CupSoda: LucideIcons.CupSoda,
  CakeSlice: LucideIcons.CakeSlice,
  Beer: LucideIcons.Beer,
  Torus: LucideIcons.Torus,
  Donut: LucideIcons.Donut,
  Egg: LucideIcons.Egg,
  GlassWater: LucideIcons.GlassWater,
  Milk: LucideIcons.Milk,
};

export type IconName = keyof typeof iconMapList;

const iconMap: Record<string, LucideIcon> = {
  ...iconMapList,
  default: LucideIcons.Utensils,
};

interface IconComponentProps extends LucideProps {
  iconName: IconName | string | null | undefined;
}

const IconComponent: React.FC<IconComponentProps> = React.memo(
  ({ iconName, size = 18, className = "mr-2 text-gray-600", color, ...rest }) => {
    
    // 1. Resolve the icon component value
    const IconValue = (iconName && iconMap[iconName]) 
      ? iconMap[iconName] 
      : iconMap.default;

    // 2. Use React.createElement to bypass JSX tag parsing issues
    // This satisfies 'erasableSyntaxOnly' because we aren't using 
    // a variable in a "type position" (the <Tag> area).
    return React.createElement(IconValue, {
      size,
      className,
      color,
      ...rest
    });
  }
);

IconComponent.displayName = "IconComponent";

export default IconComponent;