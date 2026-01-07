// src/components/MealShiftManager.tsx

import React, { useState, useEffect } from 'react';
import { useMealShifts } from '../hooks/useMealShifts';
import { type CreateMealShiftDto } from '../services/mealShiftService';
import { fetchShifts } from '../services/shift.services';
import { menuItemsService } from '../services/menu.items.service';
import api from '../services/api';

const MealShiftManager: React.FC = () => {
  const { mealShifts, loading, error, addMealShift, refetch } = useMealShifts();
  const [shifts, setShifts] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  
  // Estado inicial del formulario
  const initialState: CreateMealShiftDto = {
    date: new Date().toISOString().split('T')[0], // Fecha de hoy YYYY-MM-DD
    shiftId: 0,
    menuItemId: 0,
    quantityProduced: 0,
  };

  const [formData, setFormData] = useState<CreateMealShiftDto>(initialState);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Estados para Modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);

  // Cargar datos para los selectores
  useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftsData, itemsData] = await Promise.all([
          fetchShifts(),
          menuItemsService.getAll()
        ]);
        setShifts(shiftsData);
        setMenuItems(itemsData);
      } catch (err) {
        console.error('Error cargando datos para el formulario:', err);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'date' ? value : Number(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (formData.shiftId <= 0 || formData.menuItemId <= 0 || formData.quantityProduced <= 0) {
      setFormError('Por favor complete todos los campos correctamente.');
      return;
    }

    if (editingId) {
      setShowEditConfirmModal(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    try {
      if (editingId) {
        await api.patch(`/meal-shifts/${editingId}`, formData);
        setSuccessMessage('Producción actualizada con éxito');
        setEditingId(null);
        refetch();
      } else {
        await addMealShift(formData);
        setSuccessMessage('Producción registrada con éxito');
      }
      setFormData(initialState);
      setShowEditConfirmModal(false);
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al procesar la solicitud.');
      setShowEditConfirmModal(false);
    }
  };

  const handleEdit = (mealShift: any) => {
    setEditingId(mealShift.id);
    setFormData({
      date: mealShift.date,
      shiftId: mealShift.shiftId,
      menuItemId: mealShift.menuItemId,
      quantityProduced: mealShift.quantityProduced,
    });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.patch(`/meal-shifts/${deleteId}`, { isActive: false });
      refetch();
      setSuccessMessage('Registro eliminado correctamente');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al eliminar el registro.');
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialState);
  };

  const changeDate = (days: number) => {
    const date = new Date(filterDate);
    date.setUTCDate(date.getUTCDate() + days);
    setFilterDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Gestión de Producción Diaria</h2>

      {/* Mensajes de Error Globales */}
      {error && <div className="alert alert-danger">{error}</div>}
      {formError && <div className="alert alert-warning">{formError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="row">
        {/* Formulario de Creación */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 h6">{editingId ? 'Editar Producción' : 'Nueva Producción'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="date" className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="shiftId" className="form-label">Turno</label>
                  <select
                    className="form-select"
                    id="shiftId"
                    name="shiftId"
                    value={formData.shiftId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Seleccione un turno</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime?.substring(0, 5)} - {shift.endTime?.substring(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="menuItemId" className="form-label">Plato / Ítem</label>
                  <select
                    className="form-select"
                    id="menuItemId"
                    name="menuItemId"
                    value={formData.menuItemId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value={0}>Seleccione un ítem</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="quantityProduced" className="form-label">Cantidad Producida</label>
                  <input
                    type="number"
                    className="form-control"
                    id="quantityProduced"
                    name="quantityProduced"
                    value={formData.quantityProduced || ''}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <button type="submit" className={`btn w-100 ${editingId ? 'btn-warning' : 'btn-success'}`} disabled={loading}>
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Registrar Producción')}
                </button>

                {editingId && (
                  <button type="button" className="btn btn-secondary w-100 mt-2" onClick={handleCancelEdit}>
                    Cancelar
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Tabla de Listado */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0 h6">Historial de Producción</h5>
              <div className="d-flex align-items-center">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeDate(-1)} title="Día anterior">
                  <i className="bi bi-chevron-left"></i>
                </button>
                <input
                  type="date"
                  className="form-control form-control-sm mx-2"
                  style={{ width: 'auto' }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeDate(1)} title="Día siguiente">
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Turno</th>
                      <th>Plato</th>
                      <th className="text-center">Producido</th>
                      <th className="text-center">Disponible</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && mealShifts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4">Cargando datos...</td>
                      </tr>
                    ) : mealShifts.filter((ms: any) => ms.isActive !== false && ms.date === filterDate).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4 text-muted">No hay producciones registradas para esta fecha.</td>
                      </tr>
                    ) : (
                      mealShifts.filter((ms: any) => ms.isActive !== false && ms.date === filterDate).map((ms: any) => {
                        const shiftName = ms.shift?.name || shifts.find(s => s.id === ms.shiftId)?.name || `ID: ${ms.shiftId}`;
                        const menuItem = ms.menuItem || menuItems.find(i => i.id === ms.menuItemId);
                        const menuItemName = menuItem?.name || `ID: ${ms.menuItemId}`;
                        const iconName = menuItem?.iconName || 'circle';

                        return (
                          <tr key={ms.id}>
                            <td>{ms.date}</td>
                            <td>
                              <span className="badge bg-info text-dark bg-opacity-10 border border-info border-opacity-25">
                                {shiftName}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className={`bi bi-${iconName.toLowerCase()} me-2 text-secondary`}></i>
                                {menuItemName}
                              </div>
                            </td>
                            <td className="text-center fw-bold">{ms.quantityProduced}</td>
                            <td className="text-center">
                              <span className={`badge ${ms.quantityAvailable > 0 ? 'bg-success' : 'bg-danger'}`}>
                                {ms.quantityAvailable}
                              </span>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(ms)} title="Editar">
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(ms.id)} title="Eliminar">
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro de que desea eliminar este registro de producción? Esta acción descontará el stock disponible.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Edición */}
      {showEditConfirmModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Confirmar Edición</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro de que desea guardar los cambios en esta producción?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditConfirmModal(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={executeSubmit}>Guardar Cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealShiftManager;
