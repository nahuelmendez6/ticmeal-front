import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useConsumptionReports } from '../hooks/useConsumptionReports';
import { useConsumptionTrend } from '../hooks/useConsumptionTrend';
import ConsumptionTrendChart from './ConsumptionTrendChart';

const ConsumptionReport: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [limit, setLimit] = useState(10);

  const {
    mostConsumed,
    loading,
    error,
  } = useConsumptionReports(startDate, endDate, limit);

  const {
    trendData,
    loading: loadingTrend,
    error: errorTrend
  } = useConsumptionTrend(startDate, endDate);

  if (error || errorTrend) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error al cargar los reportes de consumo: {error || errorTrend}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4 align-items-end">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text">Desde</span>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text">Hasta</span>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-2">
          <div className="input-group">
            <span className="input-group-text">Límite</span>
            <input
              type="number"
              className="form-control"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10) || 10)}
              min="1"
            />
          </div>
        </div>
      </div>

      {(loading || loadingTrend) && (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando reportes...</span>
          </div>
        </div>
      )}

      {!loading && !loadingTrend && !error && !errorTrend && (
        <div className="row g-4">
          {/* Most Consumed Items */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Ítems más Consumidos</h5>
                {mostConsumed && mostConsumed.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={mostConsumed} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalConsumed" fill="#8884d8" name="Total Consumido" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted text-center mt-4">No hay datos para el período seleccionado.</p>}
              </div>
            </div>
          </div>

          {/* Consumption Trend Chart */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">Tendencia de Consumo</h5>
                <ConsumptionTrendChart data={trendData} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionReport;