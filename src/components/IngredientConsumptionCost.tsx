import React, { useState, useEffect, useMemo } from 'react';
import { useIngredientConsumptionCost } from '../hooks/useIngredientConsumptionCost';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const IngredientConsumptionCost: React.FC = () => {
  const { report, loading, error, fetchReport } = useIngredientConsumptionCost();
  
  // Fechas por defecto: mes actual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(startDate, endDate);
  };

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  // Transformar datos para el gráfico apilado
  const chartData = useMemo(() => {
    if (!report) return [];
    return report.map(day => {
      const dayData: any = { 
        date: day.date, 
        totalCost: day.totalCost 
      };
      day.details.forEach(detail => {
        dayData[detail.ingredientName] = detail.cost;
      });
      return dayData;
    });
  }, [report]);

  // Obtener lista única de ingredientes para generar las series del gráfico
  const ingredientKeys = useMemo(() => {
    if (!report) return [];
    const keys = new Set<string>();
    report.forEach(day => {
      day.details.forEach(detail => {
        keys.add(detail.ingredientName);
      });
    });
    return Array.from(keys);
  }, [report]);

  // Datos para el gráfico de torta (distribución total del periodo)
  const pieData = useMemo(() => {
    if (!report) return [];
    const totals: Record<string, number> = {};
    report.forEach(day => {
      day.details.forEach(detail => {
        totals[detail.ingredientName] = (totals[detail.ingredientName] || 0) + detail.cost;
      });
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [report]);

  const colors = [
    "#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", 
    "#fd7e14", "#ffc107", "#198754", "#20c997", "#0dcaf0"
  ];

  return (
    <div className="mt-4">
      <h4 className="mb-3 text-primary-emphasis">Costo de Consumo de Ingredientes</h4>
      
      <form onSubmit={handleSearch} className="row g-3 mb-4 align-items-end bg-light p-3 rounded border">
        <div className="col-md-4 col-sm-6">
          <label htmlFor="startDate" className="form-label fw-medium">Desde</label>
          <input 
            type="date" 
            className="form-control" 
            id="startDate" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            required 
          />
        </div>
        <div className="col-md-4 col-sm-6">
          <label htmlFor="endDate" className="form-label fw-medium">Hasta</label>
          <input 
            type="date" 
            className="form-control" 
            id="endDate" 
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

      {error && <div className="alert alert-danger">{error}</div>}

      {report && (
        <>
          {report.length > 0 && (
            <div className="row mb-4">
              <div className="col-lg-8 mb-4 mb-lg-0">
                <div className="card border-light shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted mb-3">Evolución Diaria de Costos</h5>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [`$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, name]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('es-AR', { dateStyle: 'full', timeZone: 'UTC' })}
                      />
                      <Legend />
                      {ingredientKeys.map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          stackId="a" 
                          fill={colors[index % colors.length]} 
                          name={key} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-light shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title text-muted mb-3">Distribución Total</h5>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, 'Costo Total']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="accordion" id="consumptionAccordion">
          {report.map((item) => (
            <div className="accordion-item" key={item.date}>
              <h2 className="accordion-header">
                <button 
                  className={`accordion-button ${expandedDates.includes(item.date) ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => toggleDate(item.date)}
                >
                  <div className="d-flex justify-content-between w-100 me-3 align-items-center">
                    <span className="fw-medium">{new Date(item.date).toLocaleDateString('es-AR', { timeZone: 'UTC', dateStyle: 'full' })}</span>
                    <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle fs-6">
                      $ {item.totalCost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </button>
              </h2>
              <div className={`accordion-collapse collapse ${expandedDates.includes(item.date) ? 'show' : ''}`}>
                <div className="accordion-body p-0">
                  <ul className="list-group list-group-flush">
                    {item.details.map((detail, idx) => (
                      <li className="list-group-item d-flex justify-content-between align-items-center ps-4" key={idx}>
                        <span>{detail.ingredientName}</span>
                        <span className="font-monospace text-muted">
                          $ {detail.cost.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          {report.length === 0 && !loading && (
            <div className="alert alert-info text-center">No se encontraron costos de consumo para el rango seleccionado.</div>
          )}
        </div>
        </>
      )}
    </div>
  );
};

export default IngredientConsumptionCost;