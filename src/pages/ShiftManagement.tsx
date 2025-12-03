import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, FilePenLine, Trash2, Power, PowerOff } from 'lucide-react';

// --- Tipos de Datos ---

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  menuActive: boolean;
}

const ShiftManagement: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    menuActive: true,
  });

  const fetchShifts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      const response = await fetch('http://localhost:3000/shifts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar los turnos');
      const data: Shift[] = await response.json();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar los turnos');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchShifts();
      setLoading(false);
    };
    loadData();
  }, [fetchShifts]);

  const handleEditClick = (shift: Shift) => {
    setEditingShift(shift);
    setError(null);
    setFormData({
      name: shift.name,
      startTime: shift.startTime.substring(0, 5), // Formato HH:mm
      endTime: shift.endTime.substring(0, 5),
      menuActive: shift.menuActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingShift(null);
    setError(null);
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      menuActive: true,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editingShift ? `http://localhost:3000/shifts/${editingShift.id}` : 'http://localhost:3000/shifts';
    const method = editingShift ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
    }; // No es necesario agregar los segundos, el input type="time" ya da el formato HH:mm

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error al ${editingShift ? 'actualizar' : 'crear'} el turno` }));
        throw new Error(errorData.message);
      }

      await fetchShifts();
      handleCancelEdit(); // Resetea el formulario
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (shiftId: number) => {
    setShiftToDelete(shiftId);
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const handleCloseDeleteModal = () => {
    setShiftToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`http://localhost:3000/shifts/${shiftToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar el turno');

      await fetchShifts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al eliminar');
    } finally {
      setSubmitting(false);
      handleCloseDeleteModal();
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">{editingShift ? 'Editando Turno' : 'Gestión de Turnos'}</h4>
      </div>

      {/* --- Formulario Fijo --- */}
      <div className="card-body border-bottom">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="name" className="form-label">Nombre del Turno</label>
              <input type="text" id="name" name="name" className="form-control form-control-sm" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-2">
              <label htmlFor="startTime" className="form-label">Hora de Inicio</label>
              <input type="time" id="startTime" name="startTime" className="form-control form-control-sm" value={formData.startTime} onChange={handleInputChange} required />
            </div>
            <div className="col-md-2">
              <label htmlFor="endTime" className="form-label">Hora de Fin</label>
              <input type="time" id="endTime" name="endTime" className="form-control form-control-sm" value={formData.endTime} onChange={handleInputChange} required />
            </div>
            <div className="col-md-2">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="menuActive" name="menuActive" checked={formData.menuActive} onChange={handleInputChange} />
                <label className="form-check-label" htmlFor="menuActive">Menú Activo</label>
              </div>
            </div>
            <div className="col-md-2 d-flex justify-content-end">
              {/* Este espacio se puede usar para el botón si se mueve aquí */}
            </div>
          </div>
          <div className="d-flex justify-content-end mt-4">
            {editingShift && (
              <button type="button" className="btn btn-secondary me-2" onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '120px' }}>
              {submitting ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <><Plus size={18} className="me-2" /> {editingShift ? 'Actualizar' : 'Crear Turno'}</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- Tabla de Turnos --- */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Horario</th>
                <th>Menú Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shifts.length > 0 ? shifts.map(shift => (
                <tr key={shift.id}>
                  <td className="fw-semibold">{shift.name}</td>
                  <td>
                    <Clock size={16} className="me-2 text-muted" />
                    {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                  </td>
                  <td>
                    {shift.menuActive ? (
                      <span className="badge bg-success-subtle text-success-emphasis rounded-pill">
                        <Power size={14} className="me-1" /> Activo
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill">
                        <PowerOff size={14} className="me-1" /> Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" title="Editar" style={{ border: 'none' }} onClick={() => handleEditClick(shift)}>
                      <FilePenLine size={18} />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" title="Eliminar" style={{ border: 'none' }} onClick={() => handleDeleteClick(shift.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center text-muted">No hay turnos creados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && (
        <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={handleCloseDeleteModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro de que desea eliminar este turno? Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteModal} disabled={submitting}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={submitting}>{submitting ? 'Eliminando...' : 'Eliminar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;