// src/types/recipe.ts
import type { Ingredient } from './ingtredient';

/**
 * Representa la estructura completa de un ingrediente dentro de una receta,
 * tal como la devuelve el backend. Incluye el objeto de ingrediente anidado.
 */
export interface RecipeIngredient {
  id: number;
  quantity: number;
  ingredient: Ingredient;
}

/**
 * Representa la estructura simplificada para enviar al backend al crear/actualizar
 * una receta. Solo contiene los IDs y cantidades.
 */
export interface RecipeInput {
  ingredientId: number;
  quantity: number;
}
