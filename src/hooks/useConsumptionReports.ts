import { useState, useEffect } from 'react';

// Interfaces for API responses
export interface MostConsumedItem {
  name: string;
  totalConsumed: number;
}

export const useConsumptionReports = (startDate: string, endDate: string, limit: number = 10) => {
  const [mostConsumed, setMostConsumed] = useState<MostConsumedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No autenticado. Por favor, inicie sesión.");
        setLoading(false);
        return;
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
      };

      const baseUrl = 'http://localhost:3000/reports';
      const queryParams = `?startDate=${startDate}&endDate=${endDate}&limit=${limit}`;

      try {
        const mostConsumedRes = await fetch(`${baseUrl}/most-consumed-items${queryParams}`, { headers });

        if (!mostConsumedRes.ok) {
          throw new Error('Error al obtener los datos de los reportes.');
        }

        const mostConsumedData = await mostConsumedRes.json();

        setMostConsumed(mostConsumedData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar los reportes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [startDate, endDate, limit]);

  return { mostConsumed, loading, error };
};