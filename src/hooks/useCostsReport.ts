import { useState, useEffect } from 'react';
import type { InventoryValueReport } from '../types/costs';
import { getInventoryValue } from '../services/costs.service';

export const useCostsReport = () => {
  const [report, setReport] = useState<InventoryValueReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await getInventoryValue();
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return { report, loading, error, refetch: fetchReport };
};