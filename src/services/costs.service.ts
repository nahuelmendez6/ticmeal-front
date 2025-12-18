import type { InventoryValueReport, IngredientConsumptionCost, MenuItemConsumptionCost } from '../types/costs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/reports';

export const getInventoryValue = async (): Promise<InventoryValueReport> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reports/inventory-value`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de costos');
  }
  return response.json();
};

export const getMenuItemConsumptionCost = async (startDate: string, endDate: string): Promise<MenuItemConsumptionCost[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reports/menu-item-consumption-cost?startDate=${startDate}&endDate=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de costos de consumo de menú');
  }
  return response.json();
};

export const getIngredientConsumptionCost = async (startDate: string, endDate: string): Promise<IngredientConsumptionCost[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/reports/ingredient-consumption-cost?startDate=${startDate}&endDate=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener el reporte de costos de consumo');
  }
  return response.json();
};