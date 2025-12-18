import type { StockMovement } from '../types/ReportTypes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getStockMovements = async (token: string, startDate: string, endDate: string): Promise<StockMovement[]> => {
  const params = new URLSearchParams({ startDate, endDate });
  const response = await fetch(`${API_URL}/reports/stock-movements?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};