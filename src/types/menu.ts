// src/types/menu.ts
import type { Ingredient } from './ingtredient'

export interface Category {
  id: number;
  companyId: string | null;
  name: string;
  description: string | null;
  createdAt: string; // suele llegar como string ISO
}



export interface RecipeIngredientRelation {
  id: number;
  quantity: number;
  ingredient: Ingredient;        // se importará desde /types/ingredient
}

export interface MenuItem {
  id: number;
  name: string;
  stock: number;
  iconName: string | null;
  cost: number | null;
  category: Category | null;
  minStock: number | null;
  isActive: boolean;
  maxOrder: number | null;
  type: 'SIMPLE' | 'COMPUESTO';

  recipeIngredients: RecipeIngredientRelation[];
}
