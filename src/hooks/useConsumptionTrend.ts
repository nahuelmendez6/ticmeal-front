import { useState, useEffect } from 'react';
import { getConsumptionTrend, type ConsumptionTrendItem } from '../services/consumptionTrendService';

export type { ConsumptionTrendItem };

export const useConsumptionTrend = (startDate: string, endDate: string) => {
  const [trendData, setTrendData] = useState<ConsumptionTrendItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');
        
        const data = await getConsumptionTrend(startDate, endDate, token);
        setTrendData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchTrend();
    }
  }, [startDate, endDate]);

  return { trendData, loading, error };
};