import React, { useState } from 'react';
import { useStockReport } from '../hooks/useStockReport';

const StockReport: React.FC = () => {
  const { movements, loading, error, startDate, setStartDate, endDate, setEndDate } = useStockReport();
  const [itemFilter, setItemFilter] = useState<'ALL' | 'MENU_ITEM' | 'INGREDIENT'>('ALL');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error al cargar el reporte: {error}
      </div>
    );
  }

  const filteredMovements = movements.filter(movement => {
    const itemTypeMatch =
      itemFilter === 'ALL' ||
      (itemFilter === 'MENU_ITEM' && movement.menuItem !== null) ||
      (itemFilter === 'INGREDIENT' && movement.ingredient !== null);

    const movementTypeMatch =
      movementFilter === 'ALL' ||
      (movementFilter === 'IN' && movement.movementType.toLowerCase() === 'in') ||
      (movementFilter === 'OUT' && movement.movementType.toLowerCase() === 'out');

    return itemTypeMatch && movementTypeMatch;
  });

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-bottom">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0 text-primary d-flex align-items-center">
            <i className="bi bi-clipboard-data me-2"></i>
            Reporte de Movimientos de Stock
          </h4>
          
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light">Desde</span>
              <input 
                type="date" 
                className="form-control" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light">Hasta</span>
              <input 
                type="date" 
                className="form-control" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3">
            <div className="btn-group btn-group-sm" role="group" aria-label="Filtro de tipo de item">
              <button
                type="button"
                className={`btn ${itemFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setItemFilter('ALL')}
              >
                Todos los Items
              </button>
              <button
                type="button"
                className={`btn ${itemFilter === 'MENU_ITEM' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setItemFilter('MENU_ITEM')}
              >
                Items del Menú
              </button>
              <button
                type="button"
                className={`btn ${itemFilter === 'INGREDIENT' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setItemFilter('INGREDIENT')}
              >
                Ingredientes
              </button>
            </div>
            <div className="btn-group btn-group-sm" role="group" aria-label="Filtro de tipo de movimiento">
              <button
                type="button"
                className={`btn ${movementFilter === 'ALL' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMovementFilter('ALL')}
              >
                Todos los Movimientos
              </button>
              <button
                type="button"
                className={`btn ${movementFilter === 'IN' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMovementFilter('IN')}
              >
                Entradas
              </button>
              <button
                type="button"
                className={`btn ${movementFilter === 'OUT' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMovementFilter('OUT')}
              >
                Salidas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          <table className="table table-hover table-striped mb-0 align-middle">
            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Tipo</th>
                <th scope="col">Nombre</th>
                <th scope="col" className="text-center">Movimiento</th>
                <th scope="col" className="text-end">Cantidad</th>
                <th scope="col" className="text-end">Stock Restante</th>
                <th scope="col">Razón</th>
                <th scope="col">Usuario</th>
                <th scope="col" className="text-center">Ticket</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => {
                  const isMenuItem = !!movement.menuItem;
                  const item = movement.menuItem || movement.ingredient;
                  const date = new Date(movement.createdAt).toLocaleString('es-ES');
                  const isOut = movement.movementType.toLowerCase() === 'out';

                  const remainingStock = movement.menuItem
                    ? movement.menuItem.stock
                    : movement.ingredient?.quantityInStock;
                  
                  const stockUnit = movement.menuItem ? 'u.' : movement.ingredient?.unit;

                  return (
                    <tr key={movement.id}>
                      <td className="text-nowrap small">{date}</td>
                      <td>
                        <span className={`badge ${isMenuItem ? 'bg-info text-dark' : 'bg-warning text-dark'}`}>
                          {isMenuItem ? 'Item Menú' : 'Ingrediente'}
                        </span>
                      </td>
                      <td className="fw-bold">{item?.name || '-'}</td>
                      <td className="text-center">
                        <span className={`badge ${isOut ? 'bg-danger' : 'bg-success'}`}>
                          {isOut ? 'SALIDA' : 'ENTRADA'}
                        </span>
                      </td>
                      <td className="text-end font-monospace">
                        {movement.quantity} {movement.unit}
                      </td>
                      <td className="text-end font-monospace fw-bold">
                        {remainingStock !== undefined && remainingStock !== null ? remainingStock.toFixed(2) : '-'} {stockUnit}
                      </td>
                      <td className="small text-muted">{movement.reason}</td>
                      <td>
                        {movement.performedBy ? (
                          <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                            <span className="fw-bold small">{movement.performedBy.firstName} {movement.performedBy.lastName}</span>
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{movement.performedBy.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td className="text-center">
                        {movement.relatedTicketId ? (
                          <span className="badge bg-secondary rounded-pill">
                            #{movement.relatedTicketId}
                          </span>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    No se encontraron movimientos para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer bg-white text-muted small">
        Total de registros: {filteredMovements.length}
      </div>
    </div>
  );
};

export default StockReport;