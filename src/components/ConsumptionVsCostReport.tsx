import React, { useState, useEffect, useMemo } from 'react';
import { useConsumptionVsCostReport, type ConsumptionVsCostItem } from '../hooks/useConsumptionVsCostReport';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis
} from 'recharts';
import { ArrowDown, ArrowUp } from 'lucide-react';

type SortKey = keyof ConsumptionVsCostItem;
type SortOrder = 'asc' | 'desc';

const ConsumptionVsCostReport: React.FC = () => {
  const { report, loading, error, fetchReport } = useConsumptionVsCostReport();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'totalCost', order: 'desc' });

  useEffect(() => {
    fetchReport(startDate, endDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(startDate, endDate);
  };

  const sortedItems = useMemo(() => {
    if (!report?.items) return [];
    const sortableItems = [...report.items];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [report, sortConfig]);

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'desc';
    if (sortConfig.key === key && sortConfig.order === 'desc') {
      order = 'asc';
    }
    setSortConfig({ key, order });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.order === 'asc' ? <ArrowUp size={14} className="ms-1" /> : <ArrowDown size={14} className="ms-1" />;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="fw-bold mb-1">{data.name}</p>
          <p className="mb-0 small">Consumo: {data.totalConsumed}</p>
          <p className="mb-0 small">Costo Unitario: ${data.unitCost.toLocaleString('es-AR')}</p>
          <p className="mb-0 small">Costo Total: ${data.totalCost.toLocaleString('es-AR')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-5">
      <h4 className="mb-3 text-primary-emphasis">Reporte de Consumo vs. Costo</h4>

      <form onSubmit={handleSearch} className="row g-3 mb-4 align-items-end bg-light p-3 rounded border">
        <div className="col-md-4 col-sm-6">
          <label htmlFor="cvcStartDate" className="form-label fw-medium">Desde</label>
          <input
            type="date"
            className="form-control"
            id="cvcStartDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4 col-sm-6">
          <label htmlFor="cvcEndDate" className="form-label fw-medium">Hasta</label>
          <input
            type="date"
            className="form-control"
            id="cvcEndDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        <div className="col-md-4 col-sm-12">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-search me-2"></i>}
            Buscar
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {report && !loading && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <h5 className="mb-0 text-secondary">Detalle de Ítems</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4" style={{ cursor: 'pointer' }} onClick={() => requestSort('name')}>Ítem {getSortIcon('name')}</th>
                      <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => requestSort('totalConsumed')}>Consumo Total {getSortIcon('totalConsumed')}</th>
                      <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => requestSort('unitCost')}>Costo Unit. {getSortIcon('unitCost')}</th>
                      <th className="text-end" style={{ cursor: 'pointer' }} onClick={() => requestSort('totalCost')}>Costo Total {getSortIcon('totalCost')}</th>
                      <th className="text-end pe-4" style={{ cursor: 'pointer' }} onClick={() => requestSort('impactPercentage')}>Impacto % {getSortIcon('impactPercentage')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-4 fw-medium">{item.name}</td>
                        <td className="text-end">{item.totalConsumed}</td>
                        <td className="text-end">$ {item.unitCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end fw-bold">$ {item.totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        <td className="text-end pe-4">{item.impactPercentage.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-muted mb-3">Platos Críticos (Consumo vs. Costo)</h5>
                <div className="flex-grow-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="totalConsumed" name="Consumo" unit=" u." label={{ value: 'Consumo Total', position: 'insideBottom', offset: -15 }} />
                      <YAxis type="number" dataKey="unitCost" name="Costo Unitario" unit="$" label={{ value: 'Costo Unitario', angle: -90, position: 'insideLeft', offset: -15 }} tickFormatter={(val) => `$${val}`} />
                      <ZAxis dataKey="name" name="name" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                      <Legend />
                      <Scatter name="Items" data={report.items.filter(i => i.totalConsumed > 0)} fill="#0d6efd" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionVsCostReport;