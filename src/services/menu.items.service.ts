const BASE_URL = 'http://localhost:3000';

export const menuItemsService = {
  async getAll(token: string) {
    const res = await fetch(`${BASE_URL}/menu-items`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Error al obtener los ítems del menú');
    }
    return res.json();
  },

  async create(data: any, token: string) {
    const res = await fetch(`${BASE_URL}/menu-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Error al crear el ítem');
    }
    return res.json();
  },

  async update(id: number, data: any, token: string) {
    const res = await fetch(`${BASE_URL}/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Error al actualizar el ítem');
    }
    return res.json();
  },

  async softDelete(id: number, token: string) {
    const res = await fetch(`${BASE_URL}/menu-items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: false })
    });
    if (!res.ok) {
      throw new Error('Error al eliminar el ítem');
    }
    return res.json();
  }
};
