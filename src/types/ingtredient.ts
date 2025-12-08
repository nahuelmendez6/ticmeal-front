// src/types/ingredient.ts

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  stock: number;
  companyId: string | null;
}

export interface RecipeIngredient {
  id: number;
  quantity: number;
  ingredient: Ingredient;
}
