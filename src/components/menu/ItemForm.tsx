import React from "react";
import {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger,
  IceCreamBowl, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, Dessert,
  Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut,
  Egg, GlassWater, Milk
} from "lucide-react";
import type { LucideProps, LucideIcon } from "lucide-react";

// Mapeo directo de iconos Lucide
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

// ----------------------------------------------------------------------
// FORM COMPONENT
// ----------------------------------------------------------------------

interface Props {
  editingItem: any | null;
  categories: any[];
  onSubmit: (formData: any, recipeIngredients: any[]) => void;
  newItemState?: any;
  setNewItemState?: any;
}

const ItemForm: React.FC<Props> = ({
  editingItem,
  categories,
  onSubmit,
  newItemState,
  setNewItemState,
}) => {
  const newItem = newItemState!;
  const setNewItem = setNewItemState!;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const isNumericField = ['stock', 'minStock', 'maxOrder', 'cost'].includes(name);

    setNewItem((prev: any) => ({
      ...prev,
      [name]: isNumericField ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newItem, []);
  };

  return (
    <div className="p-3 mb-4 border rounded">
      <form onSubmit={submit}>
        <div className="row g-3">

          {/* IZQUIERDA */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={newItem.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-sm-4 mb-3">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control"
                  value={newItem.stock}
                  onChange={handleChange}
                />
              </div>

              <div className="col-sm-4 mb-3">
                <label className="form-label">Stock Mínimo</label>
                <input
                  type="number"
                  name="minStock"
                  className="form-control"
                  value={newItem.minStock}
                  onChange={handleChange}
                />
              </div>

              <div className="col-sm-4 mb-3">
                <label className="form-label">Max. Orden</label>
                <input
                  type="number"
                  name="maxOrder"
                  className="form-control"
                  value={newItem.maxOrder}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* DERECHA */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Categoría</label>
              <select
                name="categoryId"
                className="form-select"
                value={newItem.categoryId}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-sm-6 mb-3">
                <label className="form-label">Costo</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    className="form-control"
                    value={newItem.cost}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-sm-6 mb-3">
                <label className="form-label">Ícono</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <IconComponent iconName={newItem.iconName} />
                  </span>

                  <select
                    name="iconName"
                    className="form-select"
                    value={newItem.iconName}
                    onChange={handleChange}
                  >
                    {Object.keys(iconMapList).map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTONES */}
        <div className="d-flex justify-content-end mt-3">
          {editingItem && (
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => window.location.reload()}
            >
              Cancelar
            </button>
          )}

          <button type="submit" className="btn btn-primary">
            {editingItem ? "Actualizar" : "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ItemForm;
