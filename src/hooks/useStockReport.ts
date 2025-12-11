import { useState, useEffect } from 'react';
import type { StockMovement } from '../types/ReportTypes';
import { getStockMovements } from '../services/reportService';

// Helper para formatear fecha a YYYY-MM-DD (local)
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useStockReport = () => {
  // Inicializar: Desde el 1ro del mes actual hasta hoy
  const [startDate, setStartDate] = useState(formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [endDate, setEndDate] = useState(formatDate(new Date()));

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }
        const data = await getStockMovements(token, startDate, endDate);
        setMovements(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startDate, endDate]);

  return { movements, loading, error, startDate, setStartDate, endDate, setEndDate };
};