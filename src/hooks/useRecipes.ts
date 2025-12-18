import { recipeIngredientsService } from "../services/recipe.ingredient.service";

interface RecipeIngredient {
  id?: number;
  quantity: number;
  ingredient: {
    id: number;
  };
}

interface EditingItem {
  id: number;
  recipeIngredients: RecipeIngredient[];
}

// interface NewRecipeIngredient {
//   ingredientId: string;
//   quantity: number;
// }

export const useRecipes = (token: string) => {
  
  const syncRecipe = async (editingItem: EditingItem, newRecipe: { ingredientId: number, quantity: number }[]) => {
    const original = editingItem.recipeIngredients || [];

    const toDelete = original.filter((o) => !newRecipe.some((n) => n.ingredientId === o.ingredient.id) && o.id);
    const toAdd = newRecipe.filter((n) => !original.some((o) => o.ingredient.id === n.ingredientId));
    const toUpdate = newRecipe.filter((n) => {
      const o = original.find((o) => o.ingredient.id === n.ingredientId);
      return o && o.quantity !== n.quantity;
    });

    await Promise.all([
      ...toDelete.map((o) => recipeIngredientsService.delete(o.id!, token)),
      ...toAdd.map((n) => recipeIngredientsService.add({
        menuItemId: editingItem.id,
        ingredientId: Number(n.ingredientId),
        quantity: n.quantity
      }, token)),
      ...toUpdate.map((n) => {
        const current = original.find((o) => o.ingredient.id === Number(n.ingredientId));
        return recipeIngredientsService.update(current!.id!, { quantity: n.quantity }, token);
      })
    ]);
  };

  return { syncRecipe };
};
