import React, { useState, useMemo } from 'react';
import { useCostsReport } from '../hooks/useCostsReport';
import IngredientConsumptionCost from './IngredientConsumptionCost';
import MenuItemConsumptionCost from './MenuItemConsumptionCost';
import ConsumptionVsCostReport from './ConsumptionVsCostReport';

const CostsReport: React.FC = () => {
  const { report, loading, error, refetch } = useCostsReport();
  const [openCategories, setOpenCategories] = useState<number[]>([]);

  const toggleCategory = (index: number) => {
    setOpenCategories(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const stats = useMemo(() => {
    if (!report) return null;

    const categories = report.categories;
    if (categories.length === 0) {
      return {
        mostExpensiveCategory: { category: 'N/A', totalValue: 0 },
        totalItems: 0,
        mostValuableItem: { name: 'N/A', totalValue: 0 }
      };
    }

    const mostExpensiveCategory = categories.reduce((prev, current) => 
      (prev.totalValue > current.totalValue) ? prev : current
    );

    let totalItems = 0;
    let mostValuableItem = { name: 'N/A', totalValue: 0 };

    categories.forEach(cat => {
      totalItems += cat.items.length;
      cat.items.forEach(item => {
        if (item.totalValue > mostValuableItem.totalValue) {
          mostValuableItem = item;
        }
      });
    });

    return {
      mostExpensiveCategory,
      totalItems,
      mostValuableItem
    };
  }, [report]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button className="btn btn-outline-danger btn-sm" onClick={refetch}>Reintentar</button>
      </div>
    );
  }

  if (!report || !stats) return null;

  return (
    <div className="container-fluid p-0">
      <ConsumptionVsCostReport />

      <hr className="my-5 border-secondary opacity-25" />

      {/* Cards de Resumen Estadístico */}
      <div className="row g-3 mb-4">
        {/* Card 1: Valor Total */}
        <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm border-start border-4 border-primary">
                <div className="card-body">
                    <div className="text-muted text-uppercase small fw-bold mb-1">Valor Total Inventario</div>
                    <div className="h4 fw-bold text-primary mb-0">
                        $ {report.totalInventoryValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Card 2: Categoría Principal */}
        <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm border-start border-4 border-success">
                <div className="card-body">
                    <div className="text-muted text-uppercase small fw-bold mb-1">Categoría Principal</div>
                    <div className="h5 fw-bold text-success mb-0 text-truncate" title={stats.mostExpensiveCategory.category}>
                        {stats.mostExpensiveCategory.category.replace(/_/g, ' ')}
                    </div>
                    <div className="small text-muted mt-1">
                        $ {stats.mostExpensiveCategory.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>

        {/* Card 3: Ítem más Valioso */}
        <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm border-start border-4 border-warning">
                <div className="card-body">
                    <div className="text-muted text-uppercase small fw-bold mb-1">Ítem de Mayor Valor</div>
                    <div className="h5 fw-bold text-warning mb-0 text-truncate" title={stats.mostValuableItem.name}>
                        {stats.mostValuableItem.name}
                    </div>
                    <div className="small text-muted mt-1">
                        $ {stats.mostValuableItem.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>

        {/* Card 4: Total de Ítems */}
        <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm border-start border-4 border-info">
                <div className="card-body">
                    <div className="text-muted text-uppercase small fw-bold mb-1">Total de Ítems</div>
                    <div className="h4 fw-bold text-info mb-0">
                        {stats.totalItems}
                    </div>
                    <div className="small text-muted mt-1">
                        En {report.categories.length} categorías
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Acordeón por Categorías */}
      <div className="accordion" id="costsAccordion">
        {report.categories.map((category, index) => (
          <div className="accordion-item" key={index}>
            <h2 className="accordion-header" id={`heading${index}`}>
              <button
                className={`accordion-button ${openCategories.includes(index) ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleCategory(index)}
                aria-expanded={openCategories.includes(index)}
                aria-controls={`collapse${index}`}
              >
                <div className="d-flex justify-content-between w-100 me-3">
                  <span className="fw-semibold text-capitalize">{category.category.replace(/_/g, ' ')}</span>
                  <span className="badge bg-secondary-subtle text-dark border">
                    $ {category.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </button>
            </h2>
            <div
              id={`collapse${index}`}
              className={`accordion-collapse collapse ${openCategories.includes(index) ? 'show' : ''}`}
              aria-labelledby={`heading${index}`}
            >
              <div className="accordion-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Ítem</th>
                        <th>Tipo</th>
                        <th className="text-end">Cantidad</th>
                        <th className="text-end">Costo Unit.</th>
                        <th className="text-end pe-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ps-4">{item.name}</td>
                          <td>
                            {item.type === 'ingredient' ? (
                              <span className="badge text-bg-info bg-opacity-75">Ingrediente</span>
                            ) : (
                              <span className="badge text-bg-warning bg-opacity-75">Menú</span>
                            )}
                          </td>
                          <td className="text-end">{item.quantity.toLocaleString('es-AR')}</td>
                          <td className="text-end">$ {item.unitCost.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                          <td className="text-end pe-4 fw-bold">$ {item.totalValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                      {category.items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">Sin ítems en esta categoría</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="my-5 border-secondary opacity-25" />

      <IngredientConsumptionCost />

      <hr className="my-5 border-secondary opacity-25" />

      <MenuItemConsumptionCost />

      <ConsumptionVsCostReport />
    </div>
  );
};

export default CostsReport;