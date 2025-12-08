import { useState, useCallback } from "react";
import { menuItemsService} from "../services/menu.items.service";

interface MenuItem {
  id: number;
  name: string;
  maxOrder: number | null;
  stock: number | null;
  minStock: number | null;
  cost: number | null;
  category: {
    id: number;
    name: string;
  } | null;
  iconName: string | null;
  isActive: boolean;
  recipeIngredients: any[]; // Puedes mejorar este tipo si lo necesitas
}

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const token = localStorage.getItem("token") || "";

  const fetchItems = useCallback(async () => {
    const data = await menuItemsService.getAll(token);
    setItems(data.filter((i: any) => i.isActive));
  }, [token]);

  const createItem = async (data: any) => {
    const item = await menuItemsService.create(data, token);
    await fetchItems();
    return item;
  };

  const updateItem = async (id: number, data: any) => {
    const item = await menuItemsService.update(id, data, token);
    await fetchItems();
    return item;
  };

  const deleteItem = async (id: number) => {
    await menuItemsService.softDelete(id, token);
    await fetchItems();
  };

  return {
    items,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
};
