import { useState, useCallback } from 'react';
import type { MenuItemConsumptionCost } from '../types/costs';
import { getMenuItemConsumptionCost } from '../services/costs.service';

export const useMenuItemConsumptionCost = () => {
  const [report, setReport] = useState<MenuItemConsumptionCost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItemConsumptionCost(startDate, endDate);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, fetchReport };
};