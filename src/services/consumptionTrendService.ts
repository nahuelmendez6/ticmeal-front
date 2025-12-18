export interface ConsumptionTrendItem {
  date: string;
  itemName: string;
  totalConsumed: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getConsumptionTrend = async (startDate: string, endDate: string, token: string): Promise<ConsumptionTrendItem[]> => {
  const response = await fetch(`${API_URL}/consumption-trend?startDate=${startDate}&endDate=${endDate}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener la tendencia de consumo');
  }

  return response.json();
};