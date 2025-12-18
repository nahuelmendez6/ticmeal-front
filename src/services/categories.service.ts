const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const categoriesService = {
  async getAll(token: string) {
    const res = await fetch(`${BASE_URL}/categories/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Error al obtener las categorías');
    }
    return res.json();
  },
};
