export interface CostItem {
  name: string;
  type: 'ingredient' | 'menu_item' | string;
  quantity: number;
  unitCost: number;
  totalValue: number;
}

export interface CostCategory {
  category: string;
  totalValue: number;
  items: CostItem[];
}

export interface InventoryValueReport {
  totalInventoryValue: number;
  categories: CostCategory[];
}

export interface IngredientConsumptionCostDetail {
  ingredientName: string;
  cost: number;
}

export interface IngredientConsumptionCost {
  date: string;
  totalCost: number;
  details: IngredientConsumptionCostDetail[];
}

export interface MenuItemConsumptionCostDetail {
  menuItemName: string;
  cost: number;
}

export interface MenuItemConsumptionCost {
  date: string;
  totalCost: number;
  details: MenuItemConsumptionCostDetail[];
}