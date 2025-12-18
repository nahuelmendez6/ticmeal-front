const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/recipe-ingredients';

// import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const recipeIngredientsService = {
  add(recipe: any, token: string) {
    return fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(recipe)
    });
  },

  update(id: number, data: any, token: string) {
    return fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  },

  delete(id: number, token: string) {
    return fetch(`${BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
