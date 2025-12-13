import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ConsumptionTrendItem } from '../hooks/useConsumptionTrend';

interface ConsumptionTrendChartProps {
  data: ConsumptionTrendItem[];
}

const ConsumptionTrendChart: React.FC<ConsumptionTrendChartProps> = ({ data }) => {
  const { chartData, itemNames } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], itemNames: [] };

    // Obtener fechas únicas y ordenarlas
    const uniqueDates = Array.from(new Set(data.map((d) => d.date))).sort();
    // Obtener nombres de ítems únicos
    const uniqueItems = Array.from(new Set(data.map((d) => d.itemName)));

    // Transformar datos para Recharts: un objeto por fecha con claves para cada ítem
    const transformedData = uniqueDates.map((date) => {
      const entry: any = { date };
      uniqueItems.forEach((item) => {
        const record = data.find((d) => d.date === date && d.itemName === item);
        entry[item] = record ? record.totalConsumed : 0;
      });
      return entry;
    });

    return { chartData: transformedData, itemNames: uniqueItems };
  }, [data]);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'
  ];

  if (chartData.length === 0) {
    return <p className="text-muted text-center mt-4">No hay datos de tendencia para el período seleccionado.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {itemNames.map((item, index) => (
          <Line
            key={item}
            type="monotone"
            dataKey={item}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ConsumptionTrendChart;