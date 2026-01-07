// src/services/mealShiftsService.ts

import api from './api';

// Tipos basados en la estructura JSON proporcionada
export interface Shift {
  companyId: number;
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  menuActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface MenuItem {
  companyId: number;
  id: number;
  name: string;
  stock: number;
  iconName: string;
  cost: string;
  minStock: number;
  isCooked: boolean;
  isActive: boolean;
  maxOrder: number;
  category: Category;
}

export interface MealShift {
  companyId: number;
  id: number;
  date: string;
  shiftId: number;
  menuItemId: number;
  quantityProduced: number;
  quantityAvailable: number;
  shift: Shift;
  menuItem: MenuItem;
}

export interface CreateMealShiftDto {
  date: string;
  shiftId: number;
  menuItemId: number;
  quantityProduced: number;
}

export const mealShiftsService = {
  getAll: async (): Promise<MealShift[]> => {
    const response = await api.get<MealShift[]>('/meal-shifts');
    return response.data;
  },

  create: async (data: CreateMealShiftDto): Promise<MealShift> => {
    const response = await api.post<MealShift>('/meal-shifts', data);
    return response.data;
  },
};
