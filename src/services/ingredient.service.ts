const BASE_URL = 'http://localhost:3000';

export const ingredientsService = {
  async getAll(token: string) {
    const res = await fetch(`${BASE_URL}/ingredients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error('Error al obtener los ingredientes');
    }
    return res.json();
  },
};
