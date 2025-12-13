import { useState, useCallback } from 'react';
import type { IngredientConsumptionCost } from '../types/costs';
import { getIngredientConsumptionCost } from '../services/costs.service';

export const useIngredientConsumptionCost = () => {
  const [report, setReport] = useState<IngredientConsumptionCost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIngredientConsumptionCost(startDate, endDate);
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