import { useState, useCallback } from "react";
import { menuItemsService } from "../services/menu.items.service";

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
  recipeIngredients: any[];
}

export const useMenuItems = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false); // Opcional: para manejar estados de carga

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await menuItemsService.getAll();
      // Filtramos solo los activos
      setItems(data.filter((i: MenuItem) => i.isActive));
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = async (data: any) => {
    const item = await menuItemsService.create(data);
    await fetchItems();
    return item;
  };

  const updateItem = async (id: number, data: any) => {
    const item = await menuItemsService.update(id, data);
    await fetchItems();
    return item;
  };

  const deleteItem = async (id: number) => {
    await menuItemsService.softDelete(id);
    await fetchItems();
  };

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
};