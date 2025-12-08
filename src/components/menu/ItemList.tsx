import React from "react";
import {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger,
  IceCreamBowl, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, Dessert,
  Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut,
  Egg, GlassWater, Milk
} from "lucide-react";
import type { LucideProps, LucideIcon } from "lucide-react";

// ----------------------------------------------------------------------
// ICON MAP DIRECTO
// ----------------------------------------------------------------------

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

interface IconComponentProps {
  iconName: IconName | null;
  size?: number;
}

const IconComponent: React.FC<IconComponentProps> = ({ iconName, size = 20 }) => {
  const Icon = iconName ? iconMap[iconName] ?? iconMap.default : iconMap.default;
  return <Icon size={size} />;
};

// ----------------------------------------------------------------------
// LIST COMPONENT
// ----------------------------------------------------------------------
interface MenuItem {
  id: number;
  name: string;
  iconName: IconName | null;
  stock: number | null;
  minStock: number | null;
  maxOrder: number | null;
  cost: number | null;
  isActive: boolean;
  category?: {
    name: string;
  };
  recipeIngredients: {
    id: number;
    quantity: number;
    ingredient: {
      id: number;
      name: string;
      unit: string;
    }
  }[];
}

interface Props {
  items: MenuItem[];
  selectedCategory: string | null;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

const ItemList: React.FC<Props> = ({ items, selectedCategory, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Ícono</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Max Orden</th>
            <th>Costo</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td><IconComponent iconName={item.iconName} /></td>
              <td>{item.stock || "—"}</td>
              <td>{item.minStock || "—"}</td>
              <td>{item.maxOrder || "—"}</td>
              <td>{item.cost ? `$${item.cost}` : "—"}</td>

              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEdit(item)}
                >
                  <FilePenLine size={18} />
                </button>

                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemList;
