// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

import api from './api';

export const menuItemsService = {

  async getAll() {
    const { data } = await api.get('/menu-items');
    return data;
  },

  async create(data: any) {
    const { data: newItem } = await api.post('/menu-items', data);
    return newItem; 
  },

  async update(id: number, data: any) {
    const { data: updatedItem } = await api.patch(`/menu-items/${id}`, data);
    return updatedItem; 
  },

  async softDelete(id: number) {
    const { data } = await api.patch(`/menu-items/${id}`, { isActive: false });
    return data;
  }
};
