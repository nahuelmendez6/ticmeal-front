import { useState, useCallback } from 'react';

// Interfaces based on the API response
interface ReportPeriod {
  start: string;
  end: string;
}

interface ReportSummary {
  totalPeriodCost: number;
  totalItemsServed: number;
}

export interface ConsumptionVsCostItem {
  name: string;
  unitCost: number;
  totalConsumed: number;
  totalCost: number;
  impactPercentage: number;
}

export interface ConsumptionVsCostReportData {
  period: ReportPeriod;
  summary: ReportSummary;
  items: ConsumptionVsCostItem[];
}

export const useConsumptionVsCostReport = () => {
  const [report, setReport] = useState<ConsumptionVsCostReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No autenticado. Por favor, inicie sesión.");
      }

      const url = new URL(`${baseUrl}/reports/consumption-vs-cost`);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data: ConsumptionVsCostReportData = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el reporte de consumo vs. costo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { report, loading, error, fetchReport };
};